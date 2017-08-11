import * as fs from 'fs';
import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import noCache = require('no-cache-express');
import {Router as servicesRouter} from './services';
import {IWebServerConfig, startServer} from 'express-web-server';
import {IAppConfig} from './appConfig';
import * as authDB from "./authDB";
import {IGlobal} from './global';

let app = express();

app.use(noCache);

// "application/json" parser
app.use(bodyParser.json({'limit': '100mb'}));

// local testing configuraton
var local_testing_config = JSON.parse(fs.readFileSync(__dirname + '/../config/local_testing_config.json', 'utf8'));

let config:IAppConfig = null;
// argv[2] is config file
if (process.argv.length < 3)
	config = local_testing_config;
else
	config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

//console.log(JSON.stringify(config));

let authorizationDB = new authDB.AuthorizationDB(config.dbConfig.sqlConfig, config.dbConfig.dbOptions);

let g: IGlobal = {
	config: config
	,authDB: authorizationDB
};
app.set('global', g);

app.use((req:express.Request, res:express.Response, next: express.NextFunction) => {
	console.log('remote host @' + req.connection.remoteAddress + ':' + req.connection.remotePort + ' ==> ' + req.path);
	req.connection.remoteAddress
	req.connection.on('error', (err:any) => {
		console.error('!!! request socket error on path ' + req.path + ': ' + err.code);
	});
	next();
});

app.use('/services', servicesRouter);

authorizationDB.on('connected', () => {
	console.log('connected to the database :-)');
	startServer(config.webServerConfig, app, (secure:boolean, host:string, port:number) => {
		console.log('authentication server listening at %s://%s:%s', (secure ? 'https' : 'http'), host, port);
	}, (err: any) => {
		console.error('!!! authentication server error: ' + err.code);
	});
}).on('error', (err:any) => {
	console.error('!!! database error: ' + JSON.stringify(err));
});

authorizationDB.connect();  // connect to the database
