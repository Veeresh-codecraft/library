// logsRepository.js

import { sql } from "drizzle-orm/sql/sql";
import { db } from "../db/db";
import bcrypt from "bcrypt";
import { logTable, usersTable } from "../drizzle/schema/schema";

export class LogsRepository {
  async create({ userId, accessToken, refreshToken }) {
    try {
      const result = await db.insert(logTable).values({
        userId,
        accessToken,
        refreshToken,
      });
      return result;
    } catch (error) {
      console.error("Error inserting log record:", error);
      throw error;
    }
  }
  async authenticate(userId: number, password: string) {
    try {
      // Retrieve user from database
      const result = await db
        .select()
        .from(usersTable)
        .where(sql`${usersTable.id}=${userId}`);
      const user = result[0];
      if (!user) {
        throw new Error("User not found");
      }

      // Compare provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid password");
      }

      return user; // Authentication successful
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  }
}
