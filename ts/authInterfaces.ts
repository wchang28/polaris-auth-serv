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

export interface IUserLoginParams {
	response_type : oauth2.AuthResponseType;
	username: string;
	password: string;
	signUpUserForApp: boolean;
}

export interface IAutomationLoginParams {
	username: string;
	password: string;
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