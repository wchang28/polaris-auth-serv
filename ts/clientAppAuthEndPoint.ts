import {getAJaxon} from 'ajaxon';
let $J = getAJaxon(require('jquery-no-dom'));
import * as oauth2 from 'oauth2';
import * as authInt from './authInterfaces';

export class ClientAppAuthEndpoint {
	constructor (private options:authInt.IAuthorizeEndpointOptions, public clientAppSettings:oauth2.ClientAppSettings) {}
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
	getConnectedApp(done:(err:any, connectedApp:authInt.IConnectedApp) => void) {
		this.$P("/services/authorize/get_connected_app", {}, (err:any, connectedApp: authInt.IConnectedApp) => {
			if (typeof done === 'function') done(this.getError(err), connectedApp);
		});
	}
	userLogin(response_type:oauth2.AuthResponseType, username:string, password:string, signUpUserForApp:boolean, done:(err:any, ret: authInt.ILoginResult) => void) {
		let params: authInt.IUserLoginParams = {
			response_type : response_type
			,username: username
			,password: password
			,signUpUserForApp: signUpUserForApp
		};
		this.$P("/services/authorize/user_login", params, (err:any, ret: authInt.ILoginResult) => {
			if (typeof done === 'function') done(this.getError(err), ret);
		});
	}
	automationLogin(username:string, password:string, done:(err:any, ret: authInt.ILoginResult) => void) {
		let params: authInt.IAutomationLoginParams = {
			username: username
			,password: password
		};
		this.$P("/services/authorize/automation_login", params, (err:any, ret: authInt.ILoginResult) => {
			if (typeof done === 'function') done(this.getError(err), ret);
		});
	}
	getAccessFromAuthCode(code:string, done:(err:any, access:oauth2.Access) => void) {
		let params: authInt.IGetAccessFromCodeParams = {code: code};
		this.$P("/services/authorize/get_access_from_auth_code", params, (err, access:oauth2.Access) => {
			if (typeof done === 'function') done(this.getError(err), access);
		});
	}
	refreshToken(refresh_token:string, done:(err:any, access:oauth2.Access) => void) {
		let params:authInt.IRefreshTokenParams = {refresh_token : refresh_token};
		this.$P("/services/authorize/refresh_token", params, (err, access:oauth2.Access) => {
			if (typeof done === 'function') done(this.getError(err), access);
		});
	}
	verifyAccessToken(accessToken: oauth2.AccessToken, done:(err:any, user:authInt.IAuthorizedUser) => void) {
		let params = accessToken;
		this.$P("/services/authorize/verify_token", params, (err, user) => {
			if (typeof done === 'function') done(this.getError(err), user);
		});
	}

	SSPR(username:string, done:(err:any, data:any) => void) {
		let params = {'username' : username};
		this.$P("/services/authorize/sspr", params, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});
	}
	resetPassword(pin:string, done:(err:any, data:any) => void) {
		let params = {'pin' : pin};
		this.$P("/services/authorize/reset_password", params, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});
	}
	lookupUser(username:string, done:(err:any, data:any) => void) {
		let params = {'username' : username};
		this.$P("/services/authorize/lookup_user", params, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});		
	}
	signUpNewUser(accountOptions:any, done:(err:any, data:any) => void) {
		let params = accountOptions;
		this.$P("/services/authorize/sign_up_new_user", params, (err, data) => {
			if (typeof done === 'function') done(this.getError(err), data);
		});			
	};
}