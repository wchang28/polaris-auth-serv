import {IWebServerConfig} from 'express-web-server';
import {IAuthDBConfig} from "./authDBConfig";

export interface IAppConfig {
	webServerConfig: IWebServerConfig;
	dbConfig: IAuthDBConfig;
}