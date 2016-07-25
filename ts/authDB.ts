import {SimpleMSSQL, Configuration, Options} from "mssql-simple";
import * as _ from 'lodash';
import * as oauth2 from 'oauth2';
import * as authInt from './authInterfaces';
export {Configuration as SQLConfiguration, Options as DBOptions} from "mssql-simple";

interface IUserLoginParams {
    client_id:string
	response_type : oauth2.AuthResponseType;
	username: string;
	passwordHash: string;
	signUpUserForApp: boolean;
}

interface IAutomationLoginParams {
    client_id:string
	username: string;
	passwordHash: string;
}

export class AuthorizationDB extends SimpleMSSQL {
    constructor(sqlConfig: Configuration, options?: Options) {
        super(sqlConfig, options);
    }
    private extendParams(client_id:string, params:any) : any {  // added client_id to the params
        return _.assignIn({client_id}, params);
    }
    getConnectedApp(clientAppSettings: oauth2.ClientAppSettings, done:(err:any, connectedApp: authInt.IConnectedApp) => void) : void {
        this.execute('[dbo].[stp_AuthGetConnectedApp]', clientAppSettings, done);
    }
    userLogin(client_id:string, params: authInt.IUserLoginParams, done:(err:any, loginResult: authInt.ILoginResult) => void) : void {
        let data: IUserLoginParams = {
            client_id:client_id
            ,response_type : params.response_type
            ,username: params.username
            ,passwordHash: params.password  // TODO: hash password here
            ,signUpUserForApp: params.signUpUserForApp
        }
        this.execute('[dbo].[stp_AuthUserLogin]', data, done);
    }
    automationLogin(client_id:string, params: authInt.IAutomationLoginParams, done:(err:any, loginResult: authInt.ILoginResult) => void) : void {
        let data: IAutomationLoginParams = {
            client_id:client_id
            ,username: params.username
            ,passwordHash: params.password  // TODO: hash password here
        }
        this.execute('[dbo].[stp_AuthAutomationLogin]', data, done);
    }
    getAccessFromCode(client_id:string, params: authInt.IGetAccessFromCodeParams, done:(err:any, access: oauth2.Access) => void) : void {
        let data = this.extendParams(client_id, params);
        this.execute('[dbo].[stp_AuthGetAccessFromCode]', data, done);
    }
    refreshToken(client_id:string, params: authInt.IRefreshTokenParams, done:(err:any, access: oauth2.Access) => void) : void {
        let data = this.extendParams(client_id, params);
        this.execute('[dbo].[stp_AuthRefreshToken]', data, done);
    }
    verifyAccessToken(client_id:string, accessToken: oauth2.AccessToken, done:(err:any, user: authInt.IAuthorizedUser) => void) : void {
        let data = this.extendParams(client_id, accessToken);
        this.execute('[dbo].[stp_AuthVerifyAccessToken]', data, done);
    }
}