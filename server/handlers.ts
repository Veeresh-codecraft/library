import { Request, Response, NextFunction } from "express";
import { BookRepository } from "../src/book-management/books.repository";
import { UserRepository } from "../src/user-management/user.repository";
import { TransactionRepository } from "../src/transaction/transaction.repository";
import { LogsRepository } from "../src/Logs.ts/logs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 

const bookRepository = new BookRepository();
const userRepository = new UserRepository();
const transactionRepository = new TransactionRepository();
const logsRepository = new LogsRepository();

export const addBookHandler = async (req: Request, res: Response) => {
  if (req.method === "POST" && req.path === "/books") {
    try {
      console.log("addBook started");

      // Get the request body
      const body = req.body;
      const createdBook = await bookRepository.create(body);

      // Send a successful response
      res.status(201).json({
        message: "Book added successfully",
        createdBook,
      });
    } catch (error) {
      // Send an error response
      console.error("Error creating book:", error.message);
      res.status(400).json({ message: "Duplicate entry for ISBN" });
    }
  } else {
    // Handle methods other than POST
    res.status(405).send("Method Not Allowed");
  }
};

export const getBookhandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, isbn, title } = req.query;

  try {
    if (id) {
      const book = await bookRepository.getById(Number(id));
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    } else if (isbn) {
      const book = await bookRepository.getByIsbn(+(isbn));
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    } else if (title) {
      const books = await bookRepository.getByTitle(String(title));
      if (books.length > 0) {
        res.status(200).json(books);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    } else {
      res.status(400).json({ message: "Bad Request" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteBookByIdHandler = async (req: Request, res: Response) => {
  if (req.method === "DELETE" && req.path === "/books") {
    const id = req.query.id as string;
    if (id) {
      try {
        const deletedBook = await bookRepository.delete(Number(id));
        if (deletedBook) {
          res.status(200).json({
            message: "Book deleted successfully",
            deletedBook,
          });
        } else {
          res.status(404).json({ message: "Book not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
      }
    } else {
      res.status(400).json({ message: "Missing id parameter" });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
};

export const createUserHandler = async (req: Request, res: Response) => {
  if (req.method === "POST" && req.path === "/users") {
    try {
      const { password, ...userData } = req.body;
      // Hash the password
      const SALT_ROUNDS = 10;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Create user with hashed password
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      
      const createdUser = await userRepository.create(userWithHashedPassword); 

      res.status(201).json({
        message: "User added successfully",
        createdUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
};

export const getUserHandler = async (req: Request, res: Response) => {
  const { id, phonenumber, name } = req.query;

  try {
    if (id) {
      const user = await userRepository.getById(Number(id));
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else if (phonenumber) {
      const user = await userRepository.getByPhoneNumber(String(phonenumber));
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else if (name) {
      const users = await userRepository.getByName(String(name));
      if (users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(400).json({
        message: "Missing search parameters (id, phonenumber, or name)",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteUserByIdHandler = async (req: Request, res: Response) => {
  const id = req.query.id as string;

  if (req.method === "DELETE" && req.path === "/users") {
    if (id) {
      try {
        const deletedUser = await userRepository.delete(Number(id));
        if (deletedUser) {
          res.status(200).json({
            message: "User deleted successfully",
            deletedUser,
          });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
      }
    } else {
      res.status(400).json({ message: "Missing id parameter" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export const createTransactionHandler = async (req: Request, res: Response) => {
  if (req.method === "POST" && req.path === "/transaction/create") {
    try {
      console.log("createTransaction started");

      const body = req.body;
      const createdTransaction = await transactionRepository.create(body);

      if (createdTransaction === null) {
        res.status(400).json({ message: "Failed to create transaction" });
        return;
      }

      res.status(201).json({
        message: "Transaction created successfully",
        createdTransaction,
      });
    } catch (error) {
      console.error("Error creating transaction:", error.message);
      res.status(400).json({
        message: "Error creating transaction",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export const updateReturnStatusHandler = async (
  req: Request,
  res: Response
) => {
  if (req.method === "PATCH" && req.path.startsWith("/transaction/return")) {
    try {
      console.log("updateReturnStatus started");

      const transactionId = req.body.transactionId;

      if (isNaN(Number(transactionId))) {
        res.status(400).json({ message: "Invalid transaction ID" });
        return;
      }

      const updatedTransaction = await transactionRepository.updateReturnStatus(
        transactionId
      );

      if (!updatedTransaction) {
        res
          .status(404)
          .json({ message: "Transaction not found or could not be updated" });
        return;
      }

      res.status(200).json({
        message: "Transaction return status updated successfully",
        updatedTransaction,
      });
    } catch (error) {
      console.error("Error updating return status:", error.message);
      res.status(400).json({
        message: "Error updating return status",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};


export const addLogHandler = async (req: Request, res: Response) => {
  if (req.method === "POST" && req.path === "/log/create") {
    try {
      console.log("addLog started");

      // Get the request body
      const { userId, accessToken, refreshToken } = req.body;

      // Validate the input if needed
      if (!userId || !accessToken || !refreshToken) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Call the repository to create the log entry
      const createdLog = await logsRepository.create({
        userId,
        accessToken,
        refreshToken,
      });

      // Send a successful response
      res.status(201).json({
        message: "Log entry added successfully",
        createdLog,
      });
    } catch (error) {
      // Send an error response
      console.error("Error creating log entry:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Handle methods other than POST
    res.status(405).send("Method Not Allowed");
  }
};


const secretKey = "your-secret-key"; 

export const loginUserHandler = async (req: Request, res: Response) => {
  if (req.method === "POST" && req.path === "/login") {
    try {
      const { userId, password } = req.body;

      // Fetch the user by ID from the database
      const user = await userRepository.getById(+userId);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare the entered password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate tokens
      const accessToken = jwt.sign({ userId: user.id }, secretKey, {
        expiresIn: "1h",
      });
      const refreshToken = jwt.sign({ userId: user.id }, secretKey, {
        expiresIn: "7d",
      });
 
      // Call the repository to create the log entry
      const createdLog = await logsRepository.create({
        userId,
        accessToken,
        refreshToken,
      });

      // Respond with success and tokens
      res
        .status(200)
        .json({ message: "Login successful", user, accessToken, refreshToken });
    } catch (error) {
      console.error("Error during login:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
};
