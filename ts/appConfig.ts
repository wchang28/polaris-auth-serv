import {IWebServerConfig} from 'express-web-server';
import * as authDB from "./authDB";

export interface IAppConfig {
	webServerConfig?: IWebServerConfig;
}