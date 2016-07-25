import * as oauth2 from 'oauth2';

export interface IAuthorizeEndpointOptions {
	baseUrl:string;
	rejectUnauthorized?:boolean
}

export interface IConnectedApp {
	name: string;
	allow_reset_pswd: boolean;
	allow_create_new_user: boolean;
}

export interface IAuthorizedUser {
	userId: string;
	userName: string;
}

export interface ILoginResult {
	user: IAuthorizedUser;
	access?: oauth2.Access;
	code?:string;
}