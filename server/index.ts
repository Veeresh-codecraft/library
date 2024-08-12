import express, { Request, Response, NextFunction } from "express";
import {
  addBookHandler,
  createUserHandler,
  deleteBookByIdHandler,
  deleteUserByIdHandler,
  getBookhandler,
  getUserHandler,
  createTransactionHandler,
  updateReturnStatusHandler,
  addLogHandler,
  loginUserHandler,
} from "./handlers";
import {
  corsHandler,
  parseBody,
  requestLogger,
} from "./middleware/appMiddlewares";
import {
  parseQueryParameters,
  validateBookJsonBody,
  validateQueryParameters,
} from "./middleware/bookMiddlewares";
import { validateUserJsonBody } from "./middleware/userMiddlewares";

// Create an Express application
const app = express();

// Set application-specific middlewares
app.use(requestLogger);
app.use(corsHandler);
app.use(parseBody);

// Route-specific middlewares and handlers
app.post("/books", validateBookJsonBody, addBookHandler);
app.get(
  "/books",
  parseQueryParameters,
  validateQueryParameters,
  getBookhandler
);
app.delete("/books", deleteBookByIdHandler);

app.post("/users", validateUserJsonBody, createUserHandler);
app.get("/users", getUserHandler);
app.delete("/users", deleteUserByIdHandler);

app.post("/transaction/create", createTransactionHandler);
app.patch("/transaction/return", updateReturnStatusHandler);

// add session-tokens to db 
app.post("/log/create", addLogHandler);
app.post("/login", loginUserHandler);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
