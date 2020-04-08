import path = require('path');
import * as Koa from 'koa';
import * as CORS from '@koa/cors';
import * as Compress from 'koa-compress';
import * as Bodyparser from 'koa-bodyparser';
import * as Session from 'koa-session';
import * as render from 'koa-ejs';
import * as helmet from 'koa-helmet';
import * as mount from 'koa-mount';

import * as Knex from 'knex';
import { Model, ValidationError, ForeignKeyViolationError } from 'objection';

import { Logging } from './utils/log';
import { Config } from './utils/config';
import { KnexConfig } from './utils/knexfile';

import router from './router/index';

import {Provider, Configuration } from 'oidc-provider';

import Account = require('./service/account');
import configuration = require('./utils/oidc_config');
import oidcRoutes = require('./router/oidc');

const { PORT = Config.instance.appPort, ISSUER = `http://localhost:${PORT}` } = process.env;
configuration.findAccount = Account.findAccount;

// Initialize knex.
const knex = Knex(KnexConfig.dev);
knex.on('query', (data: string | symbol) => { Logging.info({sql: data}, 'knex sql'); });
// Bind all Models to a knex instance. If you only have one database in
// your server this is all you have to do. For multi database systems, see
// the Model.bindKnex() method.
Model.knex(knex);

const app = new Koa();
app.use(helmet());
render(app, {
  cache: false,
  viewExt: 'ejs',
  layout: '_layout',
  root: path.join(__dirname, '../views'),
});

// Error handling.
//
// NOTE: This is not a good error handler, this is a simple one. See the error handing
//       recipe for a better handler: http://vincit.github.io/objection.js/#error-handling
async function errorHandler(ctx: Koa.Context, next: () => Promise<any>): Promise<void> {
  try {
    await next();
  } catch (err) {
    Logging.error(err, 'error_handle');
    if (err instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = {
        error: 'ValidationError',
        errors: err.data
      };
    } else if (err instanceof ForeignKeyViolationError) {
      ctx.status = 409;
      ctx.body = {
        error: 'ForeignKeyViolationError'
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        error: 'InternalServerError',
        message: err.message || {}
      };
    }
  }
};

app.use(CORS());
app.use(errorHandler);
app.use(Session(null, app));
app.use(Compress());
app.use(Bodyparser({ jsonLimit: '25mb' }));
app.use(router.routes()).use(router.allowedMethods());

let server;
(async(): Promise<void> => {
  let adapter;
  if (process.env.REDIS_URL) {
    adapter = require('./model/oidc_redis'); // eslint-disable-line global-require
  }

  const provider = new Provider(ISSUER, { adapter, ...configuration } as Configuration);

  provider.use(helmet());

  app.use(oidcRoutes(provider).routes());
  app.use(mount(provider.app));
  server = app.listen(PORT, () => {
    Logging.info({"application is listening on port": Config.instance.appPort}, "check its /.well-known/openid-configuration");
  });
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});


