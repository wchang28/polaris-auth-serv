import {SimpleMSSQL, Configuration, Options} from "mssql-simple";
import * as _ from 'lodash';
import * as oauth2 from 'oauth2';
import * as authInt from './authInterfaces';
export {Configuration as SQLConfiguration, Options as DBOptions} from "mssql-simple";

export class AuthorizationDB extends SimpleMSSQL {
    constructor(sqlConfig: Configuration, options?: Options) {
        super(sqlConfig, options);
    }
    getConnectedApp(clientAppSettings: oauth2.ClientAppSettings, done:(err:any, connectedApp: authInt.IConnectedApp) => void) : void {
        this.execute('[dbo].[stp_getConnectedApp]', clientAppSettings, done);
    }
}