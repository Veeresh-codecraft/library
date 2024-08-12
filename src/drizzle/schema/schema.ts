 import { date, datetime, int, mysqlTable, serial,mysqlEnum, uniqueIndex, varchar, bigint, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm/sql/sql";
 
export const booksTable = mysqlTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 255 }).notNull(),
  isbnNo: int("isbNo").notNull().unique(),
  numofPages: int("numofPages").notNull(),
  totalNumberOfCopies: int("totalNumberOfCopies").notNull(),
  availableNumberOfCopies: int("availableNumberOfCopies").notNull(),
});

export const usersTable = mysqlTable("Users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  age: int("age"), //.$default(sql`check('age >= 15 AND age <= 100')`),// check is not implemented yet in orm
  DOB: date("DOB").notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  phoneNum: bigint("phoneNum", { mode: "number", unsigned: true }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const TransactionType = mysqlEnum("transactionType", ["borrow", "return"]);
export const StatusType = mysqlEnum("status", ["pending", "completed", "overdue"]);

export const transactionsTable = mysqlTable("transactions", {
  transactionId: serial("transactionId").primaryKey(),
  bookId: int("bookId").notNull(),
  userId: int("userId").notNull(),
  transactionType: TransactionType.notNull(),
  issueddate: datetime("transactionDate").notNull(),
  dueDate: datetime("dueDate"),
  returnDate: datetime("returnDate"),
  status: StatusType.notNull(), // "pending", "completed", or "overdue"
  // HACK: Drizzle does not yet support check constraints as of writing this
  lateFees: int("lateFees"),
});

export const logTable = mysqlTable("Log", {
  id: serial("id").primaryKey(), // Add a primary key field for uniqueness
  userId: int("userId").notNull(), // Reference to user ID
  accessToken: varchar("accessToken", { length: 255 }).notNull(), // Access token field
  refreshToken: varchar("refreshToken", { length: 255 }).notNull(), // Refresh token field
  time: timestamp("time")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(), // Current timestamp
});


