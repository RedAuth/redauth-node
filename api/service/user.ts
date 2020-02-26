import * as BCrypt from 'bcrypt';
import { UniqueViolationError, ValidationError, NotFoundError } from 'objection';

import UserAccount from '../model/user';
import { ResObj } from '../common/res_obj';
import { Logging } from '../utils/log';
import { DtoUser } from '../interface/dto_user';
import { UserStatus } from '../common/user_status';

export class UserService {

    static async createUser(dtoUser: DtoUser): Promise<ResObj> {

        const user: UserAccount = new UserAccount();
        user.nickName = dtoUser.nickName;
        user.email = dtoUser.email;
        user.phone = dtoUser.phone;
        user.password = BCrypt.hashSync(dtoUser.password, 10);
        user.status = UserStatus.active;
        user.mfaToken = null;
        try {
            await UserAccount.query().insert(user);
        } catch (err) {
            Logging.error({err: err}, 'create user');
            if (err instanceof ValidationError) {
                return { code: 400, reason: 'user_invalid_input', message: "Invalid user info"};
            } else if ( err instanceof UniqueViolationError) {
                return { code: 400, reason: 'user_exist', message: "User already exist"};
            }
            return { code: 500, reason: 'user_create_failure', message: "User create failure"};
        }
        return { code: 200, message: 'User create success' };
    }

    static async findUser(dtoUser: DtoUser): Promise<ResObj> {
        Logging.debug({user: dtoUser}, 'update user');
        const findCondition: any = {};
        if (dtoUser.accountGuid) {
            findCondition["account_guid"] = Buffer.from(dtoUser.accountGuid.replace(/-/g, ''), 'hex');
        } else if (dtoUser.email) {
            findCondition.email = dtoUser.email;
        } else if (dtoUser.phone) {
            findCondition.phone = dtoUser.phone;
        } else {
            return { code: 400, reason: 'user_invalid_input', message: "Invalid user info"}; 
        }
        let user: UserAccount;
        try {
            user = await UserAccount.query().throwIfNotFound()
                .where(findCondition)
                .limit(1)
                .first();
        } catch (err) {
            Logging.error({err: err}, 'create user');
            if (err instanceof NotFoundError) {
                return { code: 404, reason: 'user_not_found', message: "User not found"};
            }
            return { code: 500, reason: 'user_found_failure', message: "User found error" };
        }
        return { code: 200, reason: 'user_found_success', message: 'User found success', result: { user: user } };
    }

    static async checkUser(dtoUser: DtoUser): Promise<ResObj> {
        const res = await UserService.findUser(dtoUser);
        if (res.code != 200) {
            return res;
        }
        if (BCrypt.compareSync(dtoUser.password, res.result.user.password)) {
            return { code: 200, reason: 'user_check_success', message: 'User check success', result: { user: res.result.user } };
        }
        return { code: 403, reason: 'user_check_failure', message: 'User check failure'};
    }

    static async updateUser(user: DtoUser): Promise<ResObj> {
        Logging.debug({user: user}, 'update user');
        const updateCondition: any = {};
        if (user.accountGuid) {
            updateCondition["account_guid"] = Buffer.from(user.accountGuid.replace(/-/g, ''), 'hex');
        } else if (user.email) {
            updateCondition.email = user.email;
        } else if (user.phone) {
            updateCondition.phone = user.phone;
        } else {
            return { code: 400, reason: 'user_invalid_input', message: "Invalid user info"}; 
        }

        const updateBody: any = {};

        if (user.status !== undefined) {
            updateBody.status = user.status;
        }
        if (user.password) {
            updateBody.password = user.password;
        }
        if (user.mfaToken) {
            updateBody.mfaToken = user.mfaToken;
        }
        if (user.nickName) {
            updateBody.nickName = user.nickName;
        }
        
        let updatedUser: UserAccount;
        try {
            updatedUser = await UserAccount.query().throwIfNotFound()
                .patchAndFetch(updateBody)
                .where(updateCondition);
        } catch (err) {
            Logging.error({err: err}, 'update user');
            if (err instanceof NotFoundError) {
                return { code: 404, reason: 'user_not_found', message: "User not found"};
            }
            return { code: 500, reason: 'user_update_failure', message: "User update error" };
        }
        return { code: 200, reason: 'user_update_success', message: 'User update success', result: { user: updatedUser } };
    }
}