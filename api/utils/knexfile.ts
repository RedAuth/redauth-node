import { Config } from './config';
import { Logging } from './log';

const KnexConfig = {
    dev: {
        client: 'mysql2',
        connection: {
            host : Config.instance.db.host,
            user: Config.instance.db.username,
            database: Config.instance.db.database,
            password: Config.instance.dbPassword
        }
    }
};

Logging.info(KnexConfig, 'knex conf');

export {KnexConfig};