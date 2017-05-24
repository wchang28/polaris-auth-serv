// route /services/authorize
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {IGlobal} from '../../global';
import * as oauth2 from 'oauth2';
import * as auth_client from 'polaris-auth-client';
import * as authDB from '../../authDB';
let ADAuth = require('adauth');

let router = express.Router();

let getGlobal = (req: express.Request) : IGlobal => {return req.app.get('global');}
let getConnectedApp = (req: express.Request) : authDB.IConnectedAppDetail => {return req['connected-app'];}

// all handlers in the '/authorize' need to have a 'x-client-app' request header field
let clientAppMiddleware = (req:express.Request, res:express.Response, next:express.NextFunction) => {
    let s = req.headers[auth_client.AuthClient.getClientAppHeaderField()];
    try {
        let clientAppSettings:oauth2.ClientAppSettings = JSON.parse(s);
        if (!clientAppSettings.client_id) {
            throw oauth2.errors.bad_client_id;
        } else {
            req['client-app'] = clientAppSettings;
            next();
        }
    } catch(e) {
        res.status(401).json(oauth2.errors.bad_client_id);
    }
}

let getClientAppVerifier = (requireRedirectUrl: boolean, requireClientSecret: boolean) => {
    return (req:express.Request, done: (err:any, connectedApp: authDB.IConnectedAppDetail) => void) => {
        let clientAppSettings:oauth2.ClientAppSettings = req['client-app'];
        if (requireRedirectUrl && !clientAppSettings.redirect_uri) {
            done(oauth2.errors.bad_redirect_uri, null);
        } else if (requireClientSecret && !clientAppSettings.client_secret) {
            done(oauth2.errors.bad_client_secret, null);
        } else {
            getGlobal(req).authDB.getConnectedApp(clientAppSettings, (err:any, connectedApp: authDB.IConnectedAppDetail) => {
                if (err)
                    done(err, null);
                else
                    done(null, connectedApp);
            })
        }
    };
}

let getClientAppVerifierMiddleware = (requireRedirectUrl: boolean, requireClientSecret: boolean) => {
    let verifier = getClientAppVerifier(requireRedirectUrl, requireClientSecret);
    return ((req:express.Request, res:express.Response, next:express.NextFunction) => {
        verifier(req, (err:any, connectedApp: authDB.IConnectedAppDetail) => {
            if (err)
                res.status(401).json(err);
            else {
                req['connected-app'] = connectedApp;
                next();               
            }
        });
    });
}

router.use(clientAppMiddleware);

router.post('/get_connected_app', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    let connectedApp = getConnectedApp(req);
    let ret: auth_client.IConnectedApp = {
        client_id: connectedApp.client_id
        ,name: connectedApp.name
        ,allow_reset_pswd: connectedApp.allow_reset_pswd
        ,allow_create_new_user: connectedApp.allow_create_new_user
        ,allow_auto_app_sign_up: connectedApp.allow_auto_app_sign_up
    }
    res.json(ret);
});

let credentialInputsVerifierMiddleware = (req:express.Request, res:express.Response, next:express.NextFunction) => {
    let params:auth_client.IAutomationLoginParams = req.body;
    if (!params.username || !params.password)
        res.status(401).json(oauth2.errors.bad_credential);
    else {
        let connectedApp = getConnectedApp(req);
        if (connectedApp.ad_pswd_verify) {
            let ad_server_url = connectedApp.ad_server_url;
            let ad_domainDn = connectedApp.ad_domainDn;
            if (!ad_server_url || !ad_domainDn)
                res.status(401).json(oauth2.errors.bad_credential);
            else {
                let adAuthOptions = {
                    url: ad_server_url
                    ,domainDn: ad_domainDn
                };
                let auth = new ADAuth(adAuthOptions);
                if (params.username.indexOf('@') === -1) {
                    let upnDomainName = adAuthOptions.domainDn.toLowerCase().replace(/,/gi, ".").replace(/dc=/gi, "");
                    params.username += "@" + upnDomainName;
                }
                /*
                if (params.username.indexOf('\\') === -1 && connectedApp.ad_default_domain)
                    params.username = connectedApp.ad_default_domain + '\\' + params.username;
                */
                auth.authenticate(params.username, params.password, (err, u) => {
                    auth.close((err:any) => {
                        if (err)
                            console.error('!!! Error closing connection to the Active Directory server: ' + JSON.stringify(err));
                        else
                            console.log('connection to the Active Directory server closed successfully :-)');
                    });
                    if (err)
                        res.status(401).json(oauth2.errors.bad_credential);
                    else {
                        req['passwordAlreadyVerified'] = true;
                        next();
                    }
                });
            }
        } else {
            req['passwordAlreadyVerified'] = false;
            next();
        }
    }
};

router.post('/user_login', getClientAppVerifierMiddleware(true, false), credentialInputsVerifierMiddleware, (req: express.Request, res: express.Response) => {
    let params:auth_client.IUserLoginParams = req.body;
    let passwordAlreadyVerified:boolean = req['passwordAlreadyVerified'];
    getGlobal(req).authDB.userLogin(getConnectedApp(req).client_id, params, !passwordAlreadyVerified, (err:any, loginResult: auth_client.ILoginResult) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(loginResult);
    });
});

router.post('/automation_login', getClientAppVerifierMiddleware(false, true), credentialInputsVerifierMiddleware, (req: express.Request, res: express.Response) => {
    let params:auth_client.IAutomationLoginParams = req.body;
    let passwordAlreadyVerified:boolean = req['passwordAlreadyVerified'];
    getGlobal(req).authDB.automationLogin(getConnectedApp(req).client_id, params, !passwordAlreadyVerified, (err:any, loginResult: auth_client.ILoginResult) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(loginResult);
    });
});

router.post('/get_access_from_auth_code', getClientAppVerifierMiddleware(true, true), (req: express.Request, res: express.Response) => {
    let params: auth_client.IGetAccessFromCodeParams = req.body;
    getGlobal(req).authDB.getAccessFromCode(getConnectedApp(req).client_id, params, (err:any, access: oauth2.Access) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(access);
    });
});

router.post('/refresh_token', getClientAppVerifierMiddleware(false, false), (req: express.Request, res: express.Response) => {
    let params: auth_client.IRefreshTokenParams = req.body;
    getGlobal(req).authDB.refreshToken(getConnectedApp(req).client_id, params, (err:any, access: oauth2.Access) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(access);
    });
});

router.post('/sspr', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    let params:auth_client.IUsernameParams = req.body;
    getGlobal(req).authDB.SSPR(params.username, (err:any, params: auth_client.IResetPasswordParams) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(params);
    });
});

router.post('/reset_password', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    let params:auth_client.IResetPasswordParams = req.body;
    getGlobal(req).authDB.resetPassword(params.pin, (err:any) => {
        if (err)
            res.status(400).json(err);
        else
            res.json({});
    });
});

router.post('/lookup_user', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    let params:auth_client.IUsernameParams = req.body;
    getGlobal(req).authDB.lookupUser(params.username, (err:any, user: auth_client.IAuthorizedUser) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(user);
    });
});

router.post('/sign_up_new_user', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    let accountOptions:auth_client.IAccountOptions = req.body;
    getGlobal(req).authDB.signUpNewUser(accountOptions, getConnectedApp(req).client_id, (err:any, user: auth_client.IAuthorizedUser) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(user);
    });
});

export {router as Router};