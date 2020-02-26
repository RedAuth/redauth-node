import * as pino from "pino";
import * as pinoCaller from 'pino-caller';
import { Config } from "./config";

let Logging: pino.Logger = pino({
    name: Config.instance.appName,
    level: 'debug'
});;

if (Config.instance.isDev) {
    Logging = pinoCaller(Logging);
}

export { Logging };
