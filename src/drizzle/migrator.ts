import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise"; 
import { AppEnv } from "../../read-env";
import path from "path";
 
async function dbMigrate() {
  try {
    const connection = await mysql.createConnection(
      AppEnv.DATABASE_URL);
    const db = drizzle(connection);
    console.log("migration  has begin");
    await migrate(db, { migrationsFolder: path.resolve("Migrations") });
    console.log("migration  has completed");
    await connection.end();
  }
  catch (error) {
    console.log("migration failed");
    console.log(`migration error: ${error}`);
  }
}

dbMigrate();