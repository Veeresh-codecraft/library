import { IPageRequest, IPagedResponse } from "../../core/pagination.model";
import { IRepository } from "../../core/repository";
import { IUser, IUserBase } from "./models/user.model";
import { Librarydb } from "../../db/librarydb";
import { WhereExpression } from "../libs/types";
import { MySqlPoolConnection } from "../../db/db-connection";
import mysql from "mysql2/promise";
import { AppEnv } from "../../read-env";
import { MySqlQueryGenerator } from "../libs/mysql-query-generator";
import { db } from "../db/db";
import { usersTable } from "../drizzle/schema/schema";
import { sql } from "drizzle-orm/sql";
/**
 * Class representing a user repository.
 * @implements {IRepository<IUserBase, IUser>}
 */
export class UserRepository implements IRepository<IUserBase, IUser> {
  mySqlPoolConnection: MySqlPoolConnection;
  pool: mysql.Pool | null;

  // librarydb: Librarydb;
  constructor() {
    this.pool = mysql.createPool(AppEnv.DATABASE_URL);
    this.mySqlPoolConnection = new MySqlPoolConnection(this.pool);
    // this.mySqlPoolConnection.initialize();
    // this.librarydb = new Librarydb();
  }
  /**
   * Creates a new user.
   * @param {IUserBase} data - The user data.
   * @returns {Promise<IUser>} The created user.
   */
  // destructure and make name.lowercase and then insert
  async create(data: IUserBase): Promise<IUser> {
    const user: IUser = { ...data, id: 0 };
    const [result] = await db.insert(usersTable).values(user).$returningId();
    console.log(`User with UserId:${result.id} has been added successfully `);
    return (await this.getById(result.id)) as IUser;
  }

  /**
   * Retrieves a user by ID.
   * @param {number} id - The ID of the user.
   * @returns {IUser | null} The user or null if not found.
   */
  async getById(id: number): Promise<IUser | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.id}=${id}`);
    if (result) {
      return result[0] as unknown as IUser;
    }
    return null;
  }
  
  async getByName(name: string) {
    const result = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.name} LIKE ${"%" +name+ "%"}`);
    return result as unknown as IUser[];
  }
  async getByPhoneNumber(phoneNumber: string) {
    const result = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.phoneNum}=${+phoneNumber}`);
    if (result) {
      return result[0] as unknown as IUser;
    }
    return null;
  }

  async update(id: number, updatedData: IUserBase): Promise<IUser | null> {
    const whereClause: WhereExpression<IUser> = {
      // UserId: { op: "EQUALS", value: id },
    };
    // this.librarydb.update<IUserBase>("users", updatedData, whereClause);
    // throw new Error("Method not implemented.");
    return null;
  }

  async delete(id: number): Promise<IUser | null> {
    const book = await this.getById(id);
    if (book) {
      await db.delete(usersTable).where(sql`${usersTable.id}=${id}`);
      return book;
    }
    return null;
  }

  list(params: IPageRequest): IPagedResponse<IUser> {
    throw new Error("Method not implemented.");
  }

  async close() {
    await this.mySqlPoolConnection.release();
    this.pool = null;
  }

  // /**
  //  * Retrieves the list of users from the database.
  //  * @private
  //  * @returns {IUser[]} The list of users.
  //  */
  // private get users(): IUser[] {
  //   return this.db.table<IUser>("users");
  // }

  // /**
  //  * Updates an existing user.
  //  * @param {number} UserIdToUpdate - The ID of the user to update.
  //  * @param {IUserBase} updatedData - The updated user data.
  //  * @returns {IUser | null} The updated user or null if not found.
  //  */
  // async update(
  //   UserIdToUpdate: number,
  //   updatedData: IUserBase
  // ): Promise<IUser | null> {
  //   // const user = await this.getById(UserIdToUpdate); //BUG
  //   // console.log(user);
  //   // if (updatedData.name != "") {
  //   //   user!.name = updatedDa ta.name;
  //   //   this.db.save();
  //   // }
  //   // if (updatedData.DOB != "") {
  //   //   user!.DOB = updatedData.DOB;
  //   //   this.db.save();
  //   // }
  //   // if (updatedData.phoneNum != NaN! || updatedData.phoneNum !== 0) {
  //   //   console.log(
  //   //     typeof updatedData.phoneNum,
  //   //     updatedData.phoneNum,
  //   //     user!.phoneNum
  //   //   );
  //   //   user!.phoneNum = updatedData.phoneNum;
  //   //   this.db.save();
  //   // }
  //   // return user;
  //   return null;
  // }

  // /**
  //  * Deletes a user by ID.
  //  * @param {number} id - The ID of the user to delete.
  //  * @returns {IUser | null} The deleted user or null if not found.
  //  */
  // async delete(id: number): Promise<IUser | null> {
  //   // const userToDelete = this.getById(id);
  //   // const index = this.users.findIndex((user) => user.UserId === id);
  //   // this.users.splice(index, 1);
  //   // this.db.save();
  //   // return userToDelete;
  //   return null;
  // }

  /**
   * Lists all users.
   */
  lists() {
    console.table();
  }

  // /**
  //  * Lists users with pagination.
  //  * @param {IPageRequest} params - The pagination parameters.
  //  * @returns {IPagedResponse<IUser>} The paginated response.
  //  */
  // list(params: IPageRequest): IPagedResponse<IUser> {
  //   console.table(this.users);
  //   throw new Error("Method not implemented.");
  // }
}

// const use = new UserRepository();
// async function createUser(use: UserRepository) {
//   await use.create(
// {
//     name: "John Doe",
//     DOB: new Date,
//     age: 34,
//     phoneNum: 1234567890,
//     address: "123 Main St, Anytown, USA",
//   }
// );

// }
// createUser(use);