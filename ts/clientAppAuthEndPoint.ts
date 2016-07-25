import {getAJaxon} from 'ajaxon';
let $J = getAJaxon(require('jquery-no-dom'));
import * as oauth2 from 'oauth2';
import {IAuthorizeEndpointOptions, IConnectedApp, IAuthorizedUser, ILoginResult} from './authInterfaces';

export class ClientAppAuthEndPoint {
	constructor (private options:IAuthorizeEndpointOptions, public clientAppSettings:oauth2.ClientAppSettings) {}
	get redirect_uri():string {return this.clientAppSettings.redirect_uri;}
	getError(httpErr) {
		if (httpErr) {
			if (httpErr.responseJSON)
				return httpErr.responseJSON;
			else if (httpErr.responseText) {
				try {
					return JSON.parse(httpErr.responseText);
				} catch(e) {
					return httpErr.responseText;
				}
			} else
				return httpErr;
		} else
			return null;
	}
	// POST
	$P(path:string, data: any, done:(err:any, ret:any) => void) {
		let headers = {
			'x-client-app': JSON.stringify(this.clientAppSettings)
		};
		$J('POST', this.options.baseUrl + path, data, done, headers, this.options.rejectUnauthorized);
	}
	/*
	getConnectedApp(done:(err:any, connectedApp:IConnectedApp) => void) {
		let data = {};
		this.$P("/services/authorize/get_connected_app", data, (err, connectedApp) => {
			if (typeof done === 'function') done(this.getError(err), connectedApp);
		});
	}
	*/
	// TODO: remove test code
	getConnectedApp(done:(err:any, connectedApp:IConnectedApp) => void) {
		let connectedApp:IConnectedApp = {
			name: 'Harvest Grid Admin'
			,allow_reset_pswd: false
			,allow_create_new_user: false			
		};
		done(null, connectedApp);
	}
	/*
	userLogin(response_type:oauth2.AuthResponseType, requireClientSecret: boolean, requireRedirectUrl: boolean, username:string, password:string, signUpUserForApp:boolean, done:(err:any, ret:ILoginResult) => void) {
		let data = {'response_type' : response_type, 'requireClientSecret': requireClientSecret, 'requireRedirectUrl': requireRedirectUrl, 'username': username, 'password': password, 'signUpUserForApp': signUpUserForApp};
		this.$P("/services/authorize/login", data, (err, ret: ILoginResult) => {
			if (typeof done === 'function') done(this.getError(err), ret);
		});
	};
	*/
	// TODO: remove test code
	userLogin(response_type:oauth2.AuthResponseType, requireClientSecret: boolean, requireRedirectUrl: boolean, username:string, password:string, signUpUserForApp:boolean, done:(err:any, ret:ILoginResult) => void) {
		let ret: ILoginResult = {
			user: {
				userId: 'gkfklgnh965yu690u50hj0j0j6'
				,userName: username
			}
			,access: {
				token_type: 'Bearer'
				,access_token: 'tiutrtugghir5899y4hggoirtwrogj45hrtg0p9wug45'
			}
		}
		done(null, ret);
	};
	getAccessFromAuthCode(code:string, done:(err:any, access:oauth2.Access) => void) {
		let data = {'code' : code};
		this.$P("/services/authorize/get_access_from_auth_code", data, (err, access:oauth2.Access) => {
			if (typeof done === 'function') done(this.getError(err), access);
		});
	};
	refreshToken(refresh_token:string, done:(err:any, access:oauth2.Access) => void) {
		let data = {'refresh_token' : refresh_token};
		this.$P("/services/authorize/refresh_token", data, (err, access:oauth2.Access) => {
			if (typeof done === 'function') done(this.getError(err), access);
		});
	};
	verifyAccessToken(accessToken: oauth2.AccessToken, done:(err:any, user:IAuthorizedUser) => void) {
		let data = accessToken;
		this.$P("/services/authorize/verify_token", data, (err, user) => {
			if (typeof done === 'function') done(this.getError(err), user);
		});
	}
	SSPR(username:string, done:(err:any, data:any) => void) {
		let data = {'username' : username};
		this.$P("/services/authorize/sspr", data, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});
	};
	resetPassword(pin:string, done:(err:any, data:any) => void) {
		let data = {'pin' : pin};
		this.$P("/services/authorize/reset_password", data, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});
	};
	lookupUser(username:string, done:(err:any, data:any) => void) {
		let data = {'username' : username};
		this.$P("/services/authorize/lookup_user", data, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});		
	};
	signUpNewUser(accountOptions:any, done:(err:any, data:any) => void) {
		let data = accountOptions;
		this.$P("/services/authorize/sign_up_new_user", data, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});			
	};
}