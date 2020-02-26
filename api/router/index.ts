import * as Router from 'koa-router';
import { userRouter } from './user';

const router: Router = new Router();

router.use('/user', userRouter.routes(), userRouter.allowedMethods());

export default router;