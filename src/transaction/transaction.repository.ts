import { UDatabase } from "../../db/userDb";
import { errorTheme, sucessTheme } from "../../core/themes";
import { IBook, IBookBase } from "../book-management/models/books.model";
import { IUser } from "../user-management/models/user.model";
import { ITransaction, ITransactionBase } from "./model/transaction.model";
import { BookRepository } from "../book-management/books.repository";
import { UserRepository } from "../user-management/user.repository";
import { count, eq, like, or, sql, SQL } from "drizzle-orm";
import mysql from "mysql2/promise";
import { join } from "path";
import { AppEnv } from "../../read-env";
import { readLine } from "../../core/input.utils";

import { MySqlTransactionPoolConnection } from "../../db/db-connection";
import { WhereExpression } from "../libs/types";
import { MySqlQueryGenerator, SqlClause } from "../libs/mysql-query-generator";
import { db } from "../db/db";
import { booksTable, transactionsTable } from "../drizzle/schema/schema";
export class TransactionRepository {
  private mySqlTransactionPoolConnection: MySqlTransactionPoolConnection;
  pool: mysql.Pool | null;
  private userRepo: UserRepository;
  private bookRepo: BookRepository;

  constructor() {
    // this.pool = mysql.createPool(AppEnv.DATABASE_URL);
    // this.mySqlTransactionPoolConnection = new MySqlTransactionPoolConnection(
    //   this.pool
    // );
    this.userRepo = new UserRepository();
    this.bookRepo = new BookRepository();
  }

  async create(data: ITransactionBase): Promise<ITransaction | null> {
    if ((await this.userRepo.getById(data.userId)) === undefined) {
      console.log(errorTheme("No Users with the ID:", data.userId));
      return null;
    }

    const book = await this.bookRepo.getById(data.bookId);

    if (book === undefined || book === null) {
      console.log(errorTheme("No book with the ID:", data.bookId));
      return null;
    } else if (book.availableNumberOfCopies <= 0) {
      console.log(errorTheme("Currently the book is not available"));
      return null;
    }

    const updatedBook: IBook = {
      ...book,
      availableNumberOfCopies: book.availableNumberOfCopies - 1,
    };

    const returnPeriod = +30;
    const returnDate: Date = addDaysToDate(returnPeriod);

    function addDaysToDate(
      daysToAdd: number,
      baseDate: Date = new Date()
    ): Date {
      const resultDate = new Date(baseDate);
      resultDate.setDate(resultDate.getDate() + daysToAdd);
      return resultDate;
    }
    const newTransaction: Omit<ITransaction, "id" | "returnDate"> = {
      ...data,
      status: "completed",
      issueddate: new Date(),
      dueDate: returnDate,
      transactionId: 0,
      transactionType: "borrow",
      lateFees: 0,
    };

    try {
      // Execution of queries:
      const createdTrxnId = await db.transaction(async (trxn) => {
        await trxn
          .update(booksTable)
          .set(updatedBook)
          .where(eq(booksTable.id, updatedBook.id));

        const [result] = await trxn
          .insert(transactionsTable)
          .values(newTransaction)
          .$returningId();
        return result.transactionId;
      });
      const issuedTransaction = (await this.getById(createdTrxnId))!;
      console.log(sucessTheme(` TRANSACTION SUCCESSFULL`));
      // console.log(issuedTransaction);
      return issuedTransaction;
    } catch (err) {
      console.log(err);
      console.log(errorTheme("TRANSACTION  fAILED "));
    } finally {
      // TODO release the db.connection
    }

    return null;
  }
  async getById(id: number): Promise<ITransaction | null> {
    const result = await db
      .select()
      .from(transactionsTable)
      .where(sql`${transactionsTable.transactionId}=${id}`);
    if (result) {
      return result[0] as unknown as ITransaction;
    }
    return null;
  }

  async updateReturnStatus(transactionId: number): Promise<ITransaction> {try {
    const transaction:ITransaction = await this.getById(transactionId);
    if (transaction) {
      if (transaction.transactionType === "return") {
        throw new Error("This book has already been returned.");
      }

      let book = await this.bookRepo.getById(transaction.bookId);
      if (!book) {
        throw new Error("Book not found.");
      }
      const updatedBook: IBook = {
        ...book,
        availableNumberOfCopies: book.availableNumberOfCopies + 1,
      };

      const updatedTransaction: ITransaction = {
        ...transaction,
        transactionType : "return",
        returnDate: new Date(),
        lateFees: lateFeesCalculator(transaction.dueDate)
      }
  

      // Execution of queries:
      const updated = await db.transaction(async (trxn) => {
        await trxn
          .update(booksTable)
          .set(updatedBook)
          .where(eq(booksTable.id, updatedBook.id));

        const [result] = await trxn
          .update(transactionsTable)
          .set(updatedTransaction)
          .where(
            eq(
              transactionsTable.transactionId,
              updatedTransaction.transactionId
            )
          );
        return result.affectedRows;
      });
      if (updated) {
        return updatedTransaction;
      } else throw new Error("Transaction could not be updated");
    } else {
      throw new Error(
        "Transaction not found. Please enter correct transaction ID."
      );
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }}

  
  //   const showTransaction = () => {
  //     const transaction = pendingTransactions[currentIndex];
  //     console.clear();
  //     console.table([transaction]);
  //     console.log(
  //       "Press '→' for next transaction, '←' for previous transaction, 'Enter' to update status, or 'q' to quit."
  //     );
  //   };

  //   process.stdin.on("keypress", handleKeyPress);
  //   showTransaction();

  //   await new Promise<void>((resolve) => {
  //     rl.on("close", resolve);
  //   });

  //   process.stdin.removeListener("keypress", handleKeyPress);
  //   if (process.stdin.isTTY) {
  //     process.stdin.setRawMode(false);
  //   }
  //   process.stdin.resume();
  // }

  // getById(id: number): ITransaction | null {
  //   const transaction = this.transactions.find((b) => b.transactionId === id);
  //   return transaction || null;
  // }

  // async updateStatus(transactionId: number): Promise<void> {
  //   const transaction = this.getById(transactionId);
  //   if (!transaction) {
  //     throw new Error("Transaction not found");
  //   }
  //   if (transaction.isReturned) {
  //     console.log("This transaction is already returned.");
  //     return;
  //   }
  //   transaction.isReturned = true;
  //   const returnedBookID = transaction.bookId;
  //   const returnedBook = this.bookrepo.getById(returnedBookID);
  //   returnedBook!.availableNumberOfCopies += 1;
  //   const currentDate = new Date();
  //   if (currentDate > new Date(transaction.returnDate)) {
  //     const lateDays = Math.ceil(
  //       (currentDate.getTime() - new Date(transaction.returnDate).getTime()) /
  //         (1000 * 60 * 60 * 24)
  //     );
  //     transaction.fine = lateDays * 10; // Assuming a fine of 10 units per day late
  //   }
  //   await this.db.save();
  //   console.log("Return status updated successfully\n");
  //   console.table(transaction);
  // }

  // async getPendingUserByBookId(bookId: number): Promise<IUser[] | null> {
  //   const books = this.transactions.filter((b) => b.bookId === bookId);
  //   if (books === undefined) {
  //     console.log(errorTheme("This book is not issued to anyone"));
  //     return null;
  //   } else {
  //     const pendingMembers = books.map((book) => {
  //       return this.userrepo.getById(book.userId);
  //     });
  //     console.table(pendingMembers);
  //     return pendingMembers as IUser[];
  //   }
  // }

  // async todaysDue() {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const due = this.transactions
  //     .filter((transaction) => {
  //       const returnDate = new Date(transaction.returnDate);
  //       return transaction.isReturned === false && returnDate < today;
  //     })
  //     .map((due) => {
  //       const exceed = today.getTime() - new Date(due.returnDate).getTime();
  //       const daysExceeded = Math.ceil(exceed / (1000 * 60 * 60 * 24));
  //       due.fine = daysExceeded * 5;
  //       return due;
  //     });
  //   console.table(due);
  // }
}
function lateFeesCalculator(dueDate: Date): number {
  const fineAmountPerDay = 5;
  const currentDate = new Date();
  if (dueDate.getDate() > currentDate.getDate()) {
    return (currentDate.getDate() - dueDate.getDate()) * fineAmountPerDay;
  }
  return 0;
}

