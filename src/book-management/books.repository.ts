import { IPageRequest, IPagedResponse } from "../../core/pagination.model";
import { IRepository } from "../../core/repository";
import { IBookBase, IBook } from "../book-management/models/books.model";
import { MySqlQueryGenerator } from "../libs/mysql-query-generator";
import { MySqlPoolConnection } from "../../db/db-connection";
import { AppEnv } from "../../read-env"; 
import mysql from "mysql2/promise";
import { WhereExpression } from "../libs/types"; 
import chalk from "chalk";
import { RowDataPacket } from "mysql2";
import Table from "cli-table3"; // npm install cli-table3 chalk
import { db } from "../db/db";
import { booksTable } from "../drizzle/schema/schema";
import { sql } from "drizzle-orm/sql";
 

//  on exitperform the pool.connection.release() and pool.end()
export class BookRepository implements IRepository<IBookBase, IBook> {
  private mySqlPoolConnection: MySqlPoolConnection;
  pool: mysql.Pool | null;

  constructor() {
    this.pool = mysql.createPool(AppEnv.DATABASE_URL); // FOR ALL in library
    this.mySqlPoolConnection = new MySqlPoolConnection(this.pool); //

    // this.mySqlPoolConnection.initialize();
  }

  /**
   * Creates a new book and adds it to the repository.
   * @param {IBookBase} data - The base data for the book to be created.
   * @returns {Promise<IBook>} The created book with assigned ID and available number of copies.
   */

  async create(data: IBookBase): Promise<IBook> {
    const book: IBook = {
      ...data,
      id: 0,
      availableNumberOfCopies: data.totalNumberOfCopies,
    };

    const [bookId] = await db.insert(booksTable).values(book).$returningId();
    console.log(`book with bookId:${bookId} has been added successfully `);
    return (await this.getById(bookId.id)) as IBook;
  }

  /**
   * Updates an existing book in the repository.
   * @param {number} id - The ID of the book to update.
   * @param {IBook} data - The new data for the book.
   * @returns {Promise<IBook | null>} The updated book or null if the book was not found.
   **/
  async update(id: number, data: IBookBase): Promise<IBook | null> {
    // console.log(data);
    const whereClause: WhereExpression<IBook> = {
      id: { op: "EQUALS", value: id },
    };
    const updateclause = MySqlQueryGenerator.generateUpdateSql(
      "books",
      data,
      whereClause
    );
    console.log(updateclause);
    const result = await this.mySqlPoolConnection.query(
      updateclause.query,
      updateclause.values
    );

    // console.log
    return null;
  }

  //   /**
  //    * Deletes a book from the repository.
  //    * @param {number} id - The ID of the book to delete.
  //    * @returns {Promise<IBook | null>} The deleted book or null if the book was not found.
  //    */

  async delete(id: number): Promise<IBook | null> {
    const book = await this.getById(id);
    if (book) {
      console.log("book found");
      await db.delete(booksTable).where(sql`${booksTable.id}=${id}`);
      return book;
    }
    return null;
  }

  //   /**
  //    * Retrieves a book by its ID.
  //    * @param {number} id - The ID of the book to retrieve.
  //    * @returns {IBook | null} The book with the specified ID or null if not found.
  //    */
  async getById(id: number): Promise<IBook | null> {
    const result = await db
      .select()
      .from(booksTable)
      .where(sql`${booksTable.id}=${id}`);
    if (result)
      {                         
      return result[0] as unknown as IBook;
    }
    return null;
  }

  async getByIsbn(isbn: number): Promise<IBook | null> {
    const result = await db
      .select()
      .from(booksTable)
      .where(sql`${booksTable.isbnNo}=${+isbn}`);
    return result[0] as unknown as IBook;
  }

 async getByTitle(title: string): Promise<IBook[]> {
  const result = await db
    .select()
    .from(booksTable)
    .where(sql`${booksTable.title} LIKE ${'%' + title + '%'}`);
  return result as unknown as IBook[];
}

  list(params: IPageRequest): IPagedResponse<IBook> {
    throw new Error("Method not implemented.");
  }

  async search(key: string) {
    const whereExpression: WhereExpression<IBook> = {
      OR: [
        { title: { op: "CONTAINS", value: `${key}` } },
        { author: { op: "CONTAINS", value: `${key}` } },
        { publisher: { op: "CONTAINS", value: `${key}` } },
        { genre: { op: "CONTAINS", value: `${key}` } },
        { isbnNo: { op: "CONTAINS", value: `${key}` } },
        { id: { op: "CONTAINS", value: `${key}` } },
      ],
    };
    const searchClause = MySqlQueryGenerator.generateSelectSql(
      "books",
      [],
      whereExpression,
      0,
      10
    );
    console.log(searchClause);

    let result: RowDataPacket[] = await this.mySqlPoolConnection.query(
      searchClause.query,
      searchClause.values
    );
    function highlightKeyword(text: string, keyword: string): string {
      const regex = new RegExp(`(${keyword})`, "gi");
      return text.replace(regex, chalk.red.bold("$1"));
    }
    function highlightBooks(books: any[], keyword: string) {
      return books.map((book) => {
        return {
          ...book,
          title: highlightKeyword(book.title, keyword),
          author: highlightKeyword(book.author, keyword),
          publisher: highlightKeyword(book.publisher, keyword),
          genre: highlightKeyword(book.genre, keyword),
          isbnNo: highlightKeyword(book.isbnNo, keyword),
          // Assuming other fields don't need highlighting
        };
      });
    }

    result = highlightBooks(result as unknown as any, key);
    const table = new Table({
      head: [
        "ID",
        "Title",
        "Author",
        "Publisher",
        "Genre",
        "ISBN No",
        "Num of Pages",
        "Total Copies",
        "Available Copies",
      ],
      colWidths: [5, 25, 20, 15, 20, 15, 10, 15, 15],
    });

    result.forEach((book) => {
      table.push([
        book.id,
        book.title,
        book.author,
        book.publisher,
        book.genre,
        book.isbnNo,
        book.numofPages,
        book.totalNumberOfCopies,
        book.availableNumberOfCopies,
      ]);
    });

    console.log(table.toString());
  }

  async close() {
    await this.mySqlPoolConnection.release();
    this.pool = null;
  }
}



// const a = new BookRepository(); 
// async function delet(a:BookRepository) {
//   console.log(await a.delete(8));
// }

// delet(a);