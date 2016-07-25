import * as express from 'express';
import * as core from 'express-serve-static-core';
import {IGlobal} from '../../global';
import * as oauth2 from 'oauth2';
import {IConnectedApp} from '../../authInterfaces';

let router = express.Router();

let getGlobal = (req: express.Request) : IGlobal => {return req.app.get('global');}

let getClientAppVerifier = (requireRedirectUrl: boolean, requireClientSecret: boolean) => {
    return (req:express.Request, res:express.Response, next:express.NextFunction) => {
        let clientAppSettings:oauth2.ClientAppSettings = req['client-app'];
        if (requireRedirectUrl && !clientAppSettings.redirect_uri) {
            res.status(401).json(oauth2.errors.bad_redirect_uri);
        } else if (requireClientSecret && !clientAppSettings.client_secret) {
            res.status(401).json(oauth2.errors.bad_client_secret);
        } else {
            getGlobal(req).authDB.getConnectedApp(clientAppSettings, (err:any, connectedApp: IConnectedApp) => {
                if (err) {
                    res.status(401).json(err);
                } else {
                    req['connected-app'] = connectedApp;
                    next();
                }
            })
        }
    };
}

router.get('get_connected_app', getClientAppVerifier(true, false), (req: express.Request, res: express.Response) => {
    res.json(req['connected-app']);
});

export {router as Router};