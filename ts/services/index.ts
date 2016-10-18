// route /services
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {Router as authrizeRouter} from './authorize';
import {Router as tokenRouter} from './token';

let router = express.Router();

router.use('/authorize', authrizeRouter);
router.use('/token', tokenRouter);

export {router as Router};