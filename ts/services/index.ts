import * as express from 'express';
import * as core from 'express-serve-static-core';
import {Router as authrizeRouter} from './authorize';
import * as  oauth2 from 'oauth2';
import * as auth_client from 'polaris-auth-client';

let router = express.Router();

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

router.use('/authorize', clientAppMiddleware, authrizeRouter);

export {router as Router};