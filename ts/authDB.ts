import {SimpleMSSQL, Configuration, Options} from "mssql-simple";
import * as _ from 'lodash';
import * as oauth2 from 'oauth2';
import * as auth_client from 'polaris-auth-client';
export {Configuration as SQLConfiguration, Options as DBOptions} from "mssql-simple";
let sha512 = require('sha512');
import * as crypto from 'crypto';

function sha512HashHex(password:string) : string {
	let hash = sha512(password)
	return hash.toString('hex');
}

function password(length:number, special:boolean) : string { 
	var iteration = 0; 
	var password = ""; 
	var randomNumber; 
	if(special == undefined){ 
		var special = false; 
	} 
	while(iteration < length){ 
		randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33; 
		if(!special){ 
			if ((randomNumber >=33) && (randomNumber <= 47)) { continue; } 
			if ((randomNumber >=58) && (randomNumber <= 64)) { continue; } 
			if ((randomNumber >=91) && (randomNumber <= 96)) { continue; } 
			if ((randomNumber >=123) && (randomNumber <= 126)) { continue; } 
		} 
		iteration++; 
		password += String.fromCharCode(randomNumber); 
	}
	return password;
}

function randomIntInc(low:number, high:number):number {return Math.floor(Math.random() * (high - low + 1) + low);}

function generateAuthCode(): string {return crypto.randomBytes(57).toString('base64').replace(/\+/gi, '-').replace(/\//gi, '_').replace(/=/gi, '.');}
function generateAccessToken(): string {return crypto.randomBytes(72).toString('base64').replace(/\+/gi, '-').replace(/\//gi, '_').replace(/=/gi, '.');}
function generateRefreshToken(): string {return crypto.randomBytes(60).toString('base64').replace(/\+/gi, '-').replace(/\//gi, '_').replace(/=/gi, '.');}
function generateTemporaryPassword(): string {return password(10, false);}
function generatePINCode(): string {
	let pin = new Array(20);
	pin[0] = randomIntInc(1,9);
	for (let i = 1; i < pin.length; i++)
		pin[i] = randomIntInc(0,9);
	return pin.join('');
}

function generateObjectId(): string {return crypto.randomBytes(16).toString('hex');}

function generateBearerAccessTokens(genRefreshToken: boolean=true) : oauth2.Access {
    let access: oauth2.Access = {token_type: 'Bearer', access_token: generateAccessToken(), refresh_token: null};
    if (genRefreshToken) access.refresh_token = generateRefreshToken();
    return access;
}

interface IError {
    error:string;
    error_description: string;
}

export interface IConnectedAppDetail extends auth_client.IConnectedApp {
    client_secret: string;
    redirect_uri: string;
	instance_url: string;
    rejectUnauthorized: boolean;
    ad_pswd_verify: boolean;
    ad_default_domain: string;
    ad_server_url: string;
    ad_domainDn: string;
    token_expiry_minutes: number;
    auth_code_expiry_minutes: number;
    func_is_user_signed_up_for_app: string;
    stp_auto_app_sign_up: string;
    allow_auto_app_sign_up: boolean;
}

interface ILoginParams {
    client_id: string
	username: string;
	passwordHash: string;
    response_type: oauth2.AuthResponseType;
    signUpUserForApp: boolean;
	token_type?: string;
	access_token?: string;
	refresh_token?: string;
	code?: string;
}

export interface IUser {
    id: string;
    username: string;
    email:string;
    firstName:string;
    lastName:string;
    displayName:string;
    companyName:string;
    mobilePhone:string;
    marketPromotiony: boolean;
    passwordIsTemporary: boolean;
    passwordExpired: boolean;
    createdDate: Date;
    createdById: string;
    lastModifiedDate: Date;
    lastModifiedById: string;
}

export class AuthorizationDB extends SimpleMSSQL {
    constructor(sqlConfig: Configuration, options?: Options) {
        super(sqlConfig, options);
    }
    private extendParams(client_id:string, params:any) : any {  // added client_id to the params
        return _.assignIn({client_id}, params);
    }
    private toAuthUser(user: IUser) : auth_client.IAuthorizedUser {
        let au: auth_client.IAuthorizedUser = {
            userId: user.id
            ,userName: user.username
            ,displayName: user.displayName
            ,email: user.email
        };
        return au;
    }
    getConnectedApp(clientAppSettings: oauth2.ClientAppSettings, done:(err:any, connectedApp: IConnectedAppDetail) => void) : void {
        this.execute('[dbo].[stp_AuthGetConnectedApp]', clientAppSettings, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1][0]);
            }
        });
    }
    userLogin(client_id:string, params: auth_client.IUserLoginParams, verifyPassword: boolean, done:(err:any, loginResult: auth_client.ILoginResult) => void) : void {
        let data: ILoginParams = {
            client_id:client_id
            ,username: params.username
            ,passwordHash: (verifyPassword ? sha512HashHex(params.password) : null)
            ,response_type : params.response_type
            ,signUpUserForApp: params.signUpUserForApp
        };
        if (params.response_type === 'token') {
            let ret = generateBearerAccessTokens(true);
            data.token_type = ret.token_type;
            data.access_token = ret.access_token;
            data.refresh_token = ret.refresh_token;
        } else {
            data.code = generateAuthCode();
        }
        //console.log(JSON.stringify(data));
        this.execute('[dbo].[stp_AuthLogin]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else {
                    let loginResult: auth_client.ILoginResult = {
                        user: this.toAuthUser(recordsets[1][0])
                    };
                    if (params.response_type === 'token')
                        loginResult.access = recordsets[2][0];
                    else
                        loginResult.code = recordsets[2][0]['code'];
                    //console.log(JSON.stringify(loginResult));    
                    done(null, loginResult);
                }
            }
        });
    }
    automationLogin(client_id:string, params: auth_client.IAutomationLoginParams, verifyPassword: boolean, done:(err:any, loginResult: auth_client.ILoginResult) => void) : void {
        let ret = generateBearerAccessTokens(false);
        let data: ILoginParams = {
            client_id:client_id
            ,username: params.username
            ,passwordHash: (verifyPassword ? sha512HashHex(params.password) : null)
            ,response_type : 'token'
            ,signUpUserForApp: false
            ,token_type: ret.token_type
            ,access_token: ret.access_token
            ,refresh_token: ret.refresh_token
        }
        //console.log(JSON.stringify(data));
        this.execute('[dbo].[stp_AuthLogin]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else {
                    let loginResult: auth_client.ILoginResult = {
                        user: this.toAuthUser(recordsets[1][0])
                        ,access: recordsets[2][0]
                    };
                    //console.log(JSON.stringify(loginResult)); 
                    done(null, loginResult);
                }
            }
        });
    }
    getAccessFromCode(client_id:string, params: auth_client.IGetAccessFromCodeParams, done:(err:any, access: oauth2.Access) => void) : void {
        let data = this.extendParams(client_id, params);
        let ret = generateBearerAccessTokens(true);
        data = _.assignIn(data, ret);
        this.execute('[dbo].[stp_AuthGetAccessFromCode]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else {
                    let access: oauth2.Access = recordsets[1][0];
                    //console.log(JSON.stringify(access));
                    done(null, access);
                }
            }
        });
    }
    refreshToken(client_id:string, params: auth_client.IRefreshTokenParams, done:(err:any, access: oauth2.Access) => void) : void {
        let data = this.extendParams(client_id, params);
        let ret = generateBearerAccessTokens(true);
        data.new_access_token = ret.access_token;
        data.new_refresh_token = ret.refresh_token;
        this.execute('[dbo].[stp_AuthRefreshToken]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else
                    done(null, recordsets[1][0]);
            }
        });
    }
    verifyAccessToken(accessToken: oauth2.AccessToken, done:(err:any, user: auth_client.IAuthorizedUser) => void) : void {
        this.execute('[dbo].[stp_AuthVerifyAccessToken]', accessToken, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else
                    done(null, this.toAuthUser(recordsets[1][0]));
            }
        });
    }
    SSPR(username:string, done:(err:any, params: auth_client.IResetPasswordParams) => void) : void {
        let pin = generatePINCode();
        this.execute('[dbo].[stp_AuthSSPR]', {username, pin}, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else
                    done(null, {pin});
            }
        });
    }
    resetPassword(pin:string, done:(err:any) => void) : void {
         this.execute('[dbo].[stp_AuthResetPassword]', {pin}, (err:any, recordsets:any[]) => {
            if (err)
                done(err);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err);
                else
                    done(null);
            }
        });
    }
    lookupUser(username:string, done:(err:any, user: auth_client.IAuthorizedUser) => void) : void {
         this.execute('[dbo].[stp_AuthLookupUser]', {username}, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else
                    done(null, this.toAuthUser(recordsets[1][0]));
            }
        });
    }
    signUpNewUser(accountOptions:auth_client.IAccountOptions, client_id:string, done:(err:any, user: auth_client.IAuthorizedUser) => void) : void {
        let data:any = {
            client_id: client_id
            ,userId: generateObjectId()
            ,username: accountOptions.username
            ,passwordHash: sha512HashHex(accountOptions.password)
            ,firstName: accountOptions.firstName
            ,lastName: accountOptions.lastName
            ,email: accountOptions.email
            ,companyName: (accountOptions.companyName ? accountOptions.companyName : null)
            ,mobilePhone: (accountOptions.mobilePhone ? accountOptions.mobilePhone : null)
            ,promotionalMaterial: (typeof accountOptions.promotionalMaterial === 'boolean' ? accountOptions.promotionalMaterial : null)
        };
        this.execute('[dbo].[stp_AuthSignUpNewUser]', data, (err:any, recordsets:any[]) => {
            if (err)
                done(err, null);
            else {
                let err:IError = recordsets[0][0];
                if (err.error)
                    done(err, null);
                else
                    done(null, this.toAuthUser(recordsets[1][0]));
            }
        });
    }
}