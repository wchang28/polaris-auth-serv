// route /services/token
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {IGlobal} from '../../global';
import * as oauth2 from 'oauth2';
import * as auth_client from 'polaris-auth-client';

let router = express.Router();

let getGlobal = (req: express.Request) : IGlobal => {return req.app.get('global');}

router.post('/verify', (req: express.Request, res: express.Response) => {
    let accessToken: oauth2.AccessToken = req.body;
    getGlobal(req).authDB.verifyAccessToken(accessToken, (err:any, user: auth_client.IAuthorizedUser) => {
        if (err)
            res.status(400).json(err);
        else
            res.json(user);
    });
});

export {router as Router};