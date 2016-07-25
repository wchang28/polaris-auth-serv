import {SimpleMSSQL, Configuration} from "mssql-simple";
import * as _ from 'lodash';
import * as oauth2 from 'oauth2';
import {IConnectedApp} from './authInterfaces';
export {Configuration} from "mssql-simple";

export interface DBOptions {
    reconnectIntervalMS?:number;
}

export class AuthorizationDB extends SimpleMSSQL {
    private static defaultOptions: DBOptions = {
        reconnectIntervalMS: 3000
    };
    public dbOptions: DBOptions;
    constructor(sqlConfig: Configuration, dbOptions: DBOptions = {}) {
        dbOptions = _.assignIn({}, AuthorizationDB.defaultOptions, (dbOptions ? dbOptions : {}));
        super(sqlConfig, dbOptions.reconnectIntervalMS);
        this.dbOptions = dbOptions;
    }
    getConnectedApp(clientAppSettings: oauth2.ClientAppSettings, done:(err:any, connectedApp: IConnectedApp) => void) : void {
        this.execute('[dbo].[stp_getConnectedApp]', clientAppSettings, done);
    }
}