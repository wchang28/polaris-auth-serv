import {SimpleMSSQL, Configuration, Options} from "mssql-simple";
import * as _ from 'lodash';
import * as oauth2 from 'oauth2';
import * as authInt from './authInterfaces';
export {Configuration as SQLConfiguration, Options as DBOptions} from "mssql-simple";
let sha512 = require('sha512');

function sha512HashHex(password:string) : string {
	let hash = sha512(password)
	return hash.toString('hex');
}

interface IError {
    error:string;
    error_description: string;
}

export interface IConnectedAppDetail extends authInt.IConnectedApp {
    redirect_uri: string;
	instance_url: string;
    ad_pswd_verify: boolean;
    ad_default_domain: string;
    ad_server_url: string;
    ad_domainDn; string;
}

interface ILoginParams {
    client_id:string
	username: string;
	passwordHash: string;
    response_type : oauth2.AuthResponseType;
    signUpUserForApp: boolean;
}

export class AuthorizationDB extends SimpleMSSQL {
    constructor(sqlConfig: Configuration, options?: Options) {
        super(sqlConfig, options);
    }
    private extendParams(client_id:string, params:any) : any {  // added client_id to the params
        return _.assignIn({client_id}, params);
    }
    getConnectedApp(clientAppSettings: oauth2.ClientAppSettings, done:(err:any, connectedApp: IConnectedAppDetail) => void) : void {
        this.execute('[dbo].[stp_AuthGetConnectedApp]', clientAppSettings, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1]);
            }
        });
    }
    userLogin(client_id:string, params: authInt.IUserLoginParams, verifyPassword: boolean, done:(err:any, loginResult: authInt.ILoginResult) => void) : void {
        let data: ILoginParams = {
            client_id:client_id
            ,username: params.username
            ,passwordHash: (verifyPassword ? sha512HashHex(params.password) : null)
            ,response_type : params.response_type
            ,signUpUserForApp: params.signUpUserForApp
        }
        this.execute('[dbo].[stp_AuthLogin]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1]);
            }
        });
    }
    automationLogin(client_id:string, params: authInt.IAutomationLoginParams, verifyPassword: boolean, done:(err:any, loginResult: authInt.ILoginResult) => void) : void {
        let data: ILoginParams = {
            client_id:client_id
            ,username: params.username
            ,passwordHash: (verifyPassword ? sha512HashHex(params.password) : null)
            ,response_type : 'token'
            ,signUpUserForApp: false
        }
        this.execute('[dbo].[stp_AuthLogin]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1]);
            }
        });
    }
    getAccessFromCode(client_id:string, params: authInt.IGetAccessFromCodeParams, done:(err:any, access: oauth2.Access) => void) : void {
        let data = this.extendParams(client_id, params);
        this.execute('[dbo].[stp_AuthGetAccessFromCode]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1]);
            }
        });
    }
    refreshToken(client_id:string, params: authInt.IRefreshTokenParams, done:(err:any, access: oauth2.Access) => void) : void {
        let data = this.extendParams(client_id, params);
        this.execute('[dbo].[stp_AuthRefreshToken]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1]);
            }
        });
    }
    verifyAccessToken(client_id:string, accessToken: oauth2.AccessToken, done:(err:any, user: authInt.IAuthorizedUser) => void) : void {
        let data = this.extendParams(client_id, accessToken);
        this.execute('[dbo].[stp_AuthVerifyAccessToken]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1]);
            }
        });
    }
}