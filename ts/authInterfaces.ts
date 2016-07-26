import * as oauth2 from 'oauth2';

export interface IAuthorizeEndpointOptions {
	baseUrl:string;
	rejectUnauthorized?:boolean
}

export interface IConnectedApp {
	client_id: string;
	name: string;
	allow_reset_pswd: boolean;
	allow_create_new_user: boolean;
}

export interface IAuthorizedUser {
	userId: string;
	userName: string;
}

export interface IAutomationLoginParams {
	username: string;
	password: string;
}

export interface IUserLoginParams extends IAutomationLoginParams {
	response_type : oauth2.AuthResponseType;
	signUpUserForApp: boolean;
}

export interface ILoginResult {
	user: IAuthorizedUser;
	access?: oauth2.Access;
	code?:string;
}

export interface IGetAccessFromCodeParams {
	code: string;
}

export interface IRefreshTokenParams {
	refresh_token: string;
}

export interface ITokenVerifyParams {
	clientAppSettings: oauth2.ClientAppSettings;
	accessToken: oauth2.AccessToken;
}