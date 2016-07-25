import * as express from 'express';
import * as core from 'express-serve-static-core';
import {IGlobal} from '../../global';
import * as oauth2 from 'oauth2';
import * as authInt from '../../authInterfaces';
import * as authDB from '../../authDB';

let router = express.Router();

let getGlobal = (req: express.Request) : IGlobal => {return req.app.get('global');}
let getConnectedApp = (req: express.Request) : authInt.IConnectedApp => {return req['connected-app'];}

let getClientAppVerifier = (requireRedirectUrl: boolean, requireClientSecret: boolean) => {
    return (req:express.Request, done: (err:any, connectedApp: authInt.IConnectedApp) => void) => {
        let clientAppSettings:oauth2.ClientAppSettings = req['client-app'];
        if (requireRedirectUrl && !clientAppSettings.redirect_uri) {
            done(oauth2.errors.bad_redirect_uri, null);
        } else if (requireClientSecret && !clientAppSettings.client_secret) {
            done(oauth2.errors.bad_client_secret, null);
        } else {
            getGlobal(req).authDB.getConnectedApp(clientAppSettings, (err:any, connectedApp: authInt.IConnectedApp) => {
                if (err) {
                    done(err, null);
                } else {
                    done(null, connectedApp);
                }
            })
        }
    };
}

let getClientAppVerifierMiddleware = (requireRedirectUrl: boolean, requireClientSecret: boolean) => {
    let verifier = getClientAppVerifier(requireRedirectUrl, requireClientSecret);
    return (req:express.Request, res:express.Response, next:express.NextFunction) => {
        verifier(req, (err:any, connectedApp: authInt.IConnectedApp) => {
            if (err)
                res.status(401).json(err);
            else {
                req['connected-app'] = connectedApp;
                next();               
            }
        });
    };
}

router.post('get_connected_app', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    res.json(getConnectedApp(req));
});

router.post('/user_login', getClientAppVerifierMiddleware(true, false), (req: express.Request, res: express.Response) => {
    let params:authInt.IUserLoginParams = req.body;
    getGlobal(req).authDB.userLogin(getConnectedApp(req).client_id, params, (err:any, loginResult: authInt.ILoginResult) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(loginResult);
    });
});

router.post('/automation_login', getClientAppVerifierMiddleware(false, true), (req: express.Request, res: express.Response) => {
    let params:authInt.IAutomationLoginParams = req.body;
    getGlobal(req).authDB.automationLogin(getConnectedApp(req).client_id, params, (err:any, loginResult: authInt.ILoginResult) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(loginResult);
    });
});

router.post('/get_access_from_auth_code', getClientAppVerifierMiddleware(true, true), (req: express.Request, res: express.Response) => {
    let params: authInt.IGetAccessFromCodeParams = req.body;
    getGlobal(req).authDB.getAccessFromCode(getConnectedApp(req).client_id, params, (err:any, access: oauth2.Access) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(access);
    });
});

router.post('/refresh_token', getClientAppVerifierMiddleware(false, false), (req: express.Request, res: express.Response) => {
    let params: authInt.IRefreshTokenParams = req.body;
    getGlobal(req).authDB.refreshToken(getConnectedApp(req).client_id, params, (err:any, access: oauth2.Access) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(access);
    });
});

router.post('/verify_token', getClientAppVerifierMiddleware(true, true), (req: express.Request, res: express.Response) => {
    let accessToken: oauth2.AccessToken = req.body;
    getGlobal(req).authDB.verifyAccessToken(getConnectedApp(req).client_id, accessToken, (err:any, user: authInt.IAuthorizedUser) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(user);
    });
});

export {router as Router};