import * as Router from 'koa-router';
import * as Koa from 'koa';
import { Logging } from '../utils/log';
import { DtoUser } from '../interface/dto_user';
import { UserService } from '../service/user';

export const userRouter: Router = new Router();

function removeProtectedFeild(user: DtoUser): void {
    if (user.password !== undefined) {
        delete user.password;
    }
    if (user.mfaToken !== undefined) {
        delete user.mfaToken;
    }
}

userRouter.post('/login', async(ctx: Koa.Context) => {
    Logging.info(ctx.request, 'user login');
    const user = ctx.request.body as DtoUser;
    const res = await UserService.checkUser(user);
    ctx.status = res.code;
    if (res && res.result && res.result.user) {
        removeProtectedFeild(res.result.user);
    }
    ctx.body = res;
}).get('/:id', async(ctx: Koa.Context) => {
    Logging.debug(ctx.params, 'user get');
    const res = await UserService.findUser({accountGuid: ctx.params.id});
    ctx.status = res.code;
    if (res && res.result && res.result.user) {
        removeProtectedFeild(res.result.user);
    }
    ctx.body = res;
}).post('/signup', async(ctx: Koa.Context) => {
    Logging.info({body: ctx.request.body}, 'user create');
    const data = ctx.request.body as DtoUser;
    const res = await UserService.createUser(data);
    ctx.status = res.code;
    if (res && res.result && res.result.user) {
        removeProtectedFeild(res.result.user);
    }
    ctx.body = res;
});
