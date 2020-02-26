import { createConnection, Connection, ConnectionOptions, getConnection } from 'typeorm';
import { Logging } from './log';
import { Config } from './config';

export class ConnectionManager {
    private static instance: Connection = null;
    private static isInitialize = false;

    private static connectionOptions: ConnectionOptions = {
        ...Config.instance.db,
        host: Config.instance.db.host,
        port: Config.instance.db.port,
        username: Config.instance.db.username,
        database: Config.instance.db.database,
        password: Config.instance.db.password,
        type: 'mysql',
        logging: {
            logger: (level: string, message: any) => Logging.info(message),
            logQueries: true,
            logSchemaCreation: true,
            logFailedQueryError: true,
        },
        autoSchemaSync: true,
        entities: [__dirname + '/../model/{*.ts,*.js}'],
    };

    static async getInstance(): Promise<Connection> {
        if (!ConnectionManager.isInitialize) {
            ConnectionManager.isInitialize = true;
            ConnectionManager.instance = await createConnection(ConnectionManager.connectionOptions);
        }
        while (ConnectionManager.instance === null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return getConnection();
    }

    static async init(): Promise<any> {
        await ConnectionManager.getInstance();
    }
}