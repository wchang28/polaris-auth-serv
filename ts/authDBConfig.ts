import {SQLConfiguration, DBOptions} from './authDB';

export interface IAuthDBConfig {
    sqlConfig: SQLConfiguration
    dbOptions?: DBOptions
}