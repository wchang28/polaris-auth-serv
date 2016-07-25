import {IAppConfig} from './appConfig';
import {AuthorizationDB} from "./authDB";

export interface IGlobal {
    config: IAppConfig;
    authDB: AuthorizationDB;
}