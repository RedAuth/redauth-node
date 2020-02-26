import * as fs from 'fs';
import * as path from 'path';
import { Logging } from './log';

export class Config {

    // eslint-disable-next-line
    private _config: Record<string, any>;

    static readonly instance = new Config();

    private constructor() {
        this._config = require('../../appconfig');
    }

    init(): null {
        const frontEndJSFolder = path.join(__dirname, '../public/static/js');
        if (!fs.existsSync(frontEndJSFolder)) {
            Logging.warn(`dir ${frontEndJSFolder} is not a valid path`);
            return;
        }
        const files = fs.readdirSync(frontEndJSFolder).filter(value => value.endsWith('.js') && fs.lstatSync(path.join(frontEndJSFolder, value)).isFile);
        files.forEach(file => {
            const filePath = path.join(frontEndJSFolder, file);
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace('HITCHHIKER_APP_HOST', this.appHost).replace(/hitchhiker_\w+?(?=")/g, `hitchhiker_${this.appLanguage}`);
            fs.writeFileSync(filePath, content, { encoding: 'utf8' });
        });
    }

    get env(): string {
        return this.app.env;
    }

    get isDev(): boolean {
        return this.env === 'DEV';
    }

    get isProd(): boolean {
        return this.env === 'PROD';
    }

    get needRegisterMailConfirm(): boolean {
        return this._config.user.registerMailConfirm;
    }

    // eslint-disable-next-line
    get mail(): any {
        return this._config.mail;
    }

    // eslint-disable-next-line
    get app(): any {
        return this._config.app;
    }

    get appName(): string {
        return this.app.name;
    }

    get appApi(): string {
        return this.isDev ? this.app.api : (`${process.env.HITCHHIKER_APP_HOST}api/` || this.app.api);
    }

    get appHost(): string {
        return this.isDev ? this.app.host : (process.env.HITCHHIKER_APP_HOST || this.app.host);
    }

    get appLanguage(): string {
        return this.isDev ? this.app.language : (process.env.HITCHHIKER_APP_LANG || this.app.language);
    }

    get appPort(): number {
        let port = this.getValidNum(process.env.HITCHHIKER_APP_PORT || this.appHost.substr(this.appHost.lastIndexOf(':') + 1).replace('/', ''), this.app.port);
        if (!(/^[0-9]*$/.test(port.toString()))) {
            port = 8080;
        }
        return this.isDev ?  this.app.port : port;
    }

    // eslint-disable-next-line
    get schedule(): any {
        return this._config.schedule;
    }

    // eslint-disable-next-line
    get db(): any {
        return this._config.db;
    }

    get encryptPassword(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_ENCRYPT_PASSWORD, this._config.app.encryptPassword);
    }

    get scheduleDuration(): number {
        return this.getValidNum(process.env.HITCHHIKER_SCHEDULE_DURATION, this.schedule.duration);
    }

    get scheduleStoreUnit(): string {
        return process.env.HITCHHIKER_SCHEDULE_STORE_UNIT || this.schedule.storeUnit;
    }

    get scheduleStoreLimit(): number {
        return this.getValidNum(process.env.HITCHHIKER_SCHEDULE_STORE_LIMIT, this.schedule.storeLimit);
    }

    get scheduleStoreContent(): string {
        return process.env.HITCHHIKER_SCHEDULE_STORE_CONTENT || this.schedule.storeContent;
    }

    get schedulePageSize(): number {
        return this.getValidNum(process.env.HITCHHIKER_SCHEDULE_PAGESIZE, this.schedule.pageSize);
    }

    get stressType(): string {
        return process.env.HITCHHIKER_STRESS_TYPE || this._config.stress.type;
    }

    get stressMaxCount(): number {
        return this.getValidNum(process.env.HITCHHIKER_STRESS_COUNT, this._config.stress.storeMaxCount);
    }

    get stressHost(): string {
        let host = process.env.HITCHHIKER_STRESS_HOST || this._config.stress.stressHost;
        host = host || this.appHost.replace(/^http(s?):\/\//g, 'ws://');
        if (/:\d+/.test(host)) {
            host = host.replace(/:\d+/, `:${this.stressPort}`);
        } else {
            host = host.endsWith('/') ? `${host.substr(0, host.length - 1)}:${this.stressPort}/` : `${host}:${this.stressPort}/`;
        }

        return host;
    }

    get stressPort(): number {
        return this.isDev ? 11011 : (this.getValidNum(process.env.HITCHHIKER_STRESS_PORT, this._config.stress.stressPort));
    }

    get stressUpdateInterval(): number {
        return this.getValidNum(process.env.HITCHHIKER_STRESS_UPDATE_INTERVAL, this._config.stress.stressUpdateInterval);
    }

    get sync(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_SYNC_ONOFF, this.app.sync);
    }

    get syncInterval(): number {
        return this.getValidNum(process.env.HITCHHIKER_SYNC_INTERVAL, this.app.syncInterval);
    }

    get defaultHeaders(): string {
        return process.env.HITCHHIKER_DEFAULT_HEADERS || (this._config.app.defaultHeaders ? this._config.app.defaultHeaders.join('\n') : '');
    }

    get safeVM(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_SAFE_VM, this.app.safeVM);
    }

    get enableUpload(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_ENABLE_UPLOAD, this.app.enableUpload);
    }

    get scriptTimeout(): number {
        return this.getValidNum(process.env.HITCHHIKER_SCRIPT_TIMEOUT, this.app.scriptTimeout);
    }

    get customMailType(): string {
        return process.env.HITCHHIKER_MAIL_CUSTOM_TYPE || this.mail.customType;
    }

    get customMailApi(): string {
        return process.env.HITCHHIKER_MAIL_API || this.mail.customApi;
    }

    get customMailSmtpHost(): string  {
        return process.env.HITCHHIKER_MAIL_SMTP_HOST || this.mail.smtp.host;
    }

    get customMailSmtpPort(): number {
        return this.getValidNum(process.env.HITCHHIKER_MAIL_SMTP_PORT, this.mail.smtp.port);
    }

    get customMailSmtpTLS(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_MAIL_SMTP_TLS, this.mail.smtp.tls);
    }

    get customMailSmtpUser(): string  {
        return process.env.HITCHHIKER_MAIL_SMTP_USER || this.mail.smtp.user;
    }

    get customMailSmtpFrom(): string  {
        return process.env.HITCHHIKER_MAIL_SMTP_From || this.mail.smtp.from;
    }

    get customMailSmtpNickname(): string  {
        return process.env.HITCHHIKER_MAIL_SMTP_NICKNAME || this.mail.smtp.nickname;
    }

    get customMailSmtpPass(): string  {
        return process.env.HITCHHIKER_MAIL_SMTP_PASS || this.mail.smtp.pass;
    }

    get customMailSmtpRejectUnauthorized(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_MAIL_SMTP_RU, this.mail.smtp.rejectUnauthorized);
    }

    get inviteMemberDirectly(): boolean {
        return this.getValidBoolean(process.env.HITCHHIKER_APP_INVITE_DIRECTLY, this.app.inviteMemberDirectly);
    }

    get requestTimeout(): number {
        return this.getValidNum(process.env.HITCHHIKER_APP_SCRIPT_TIMEOUT, this.app.requestTimeout);
    }

    private getValidNum(envVar: string, spare: number): number {
        return envVar === undefined ? spare : parseInt(envVar);
    }

    private getValidBoolean(envVar: string, spare: boolean): boolean {
        return envVar === undefined ? spare : (envVar === '1' || envVar === 'true');
    }
}