import { Model, snakeCaseMappers, ColumnNameMappers } from 'objection';
import { DtoUser } from '../interface/dto_user';

// eslint-disable-next-line
interface UserAccount extends DtoUser {};
class UserAccount extends Model {
    // Table name is the only required property.
    static tableName = 'login_account';

    // Optional JSON schema. This is not the database schema! Nothing is generated
    // based on this. This is only used for validation. Whenever a model instance
    // is created it is checked against this schema. http://json-schema.org/.
    static jsonSchema = {
        type: 'object',
        required: ['nickName', 'password'],

        properties: {
            accountGuid: { type: 'integer' },
            email: { type: ['string', 'null']},
            nikcName: { type: ['string'], minLength: 6, maxLength: 64 },
            password: { type: 'string', minLength: 1, maxLength: 64 },
            phone: { type: ['string', 'mull' ], minLength: 1, maxLength: 32 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
        }
    }

    static get columnNameMappers(): ColumnNameMappers {
        return snakeCaseMappers();
    }

    $parseDatabaseJson(json: any): any {
        json = super.$parseDatabaseJson(json);
        if (json.accountGuid) {
          json.accountGuid = json.accountGuid.toString('hex');
        }
    
        if (json.password) {
            json.password = json.password.toString();
        }

        return json;
      }
    
      $formatDatabaseJson(json: any): any {
        if (json.accountGuid) {
          json.accountGuid = Buffer.from(json.accountGuid.replace(/-/g, ''), 'hex');
        }
    
        return super.$formatDatabaseJson(json);
      }
}

export default UserAccount;
/*
import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class LoginAccount {

    @PrimaryColumn('binary', {unique: true, nullable: true})
    account_guid: string;

    @Column('string', 'nick_name')
    nick_name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    phone: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
*/

