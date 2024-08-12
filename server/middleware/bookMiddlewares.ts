import { Request, Response, NextFunction } from "express";
import { IBook } from "../../src/book-management/models/books.model";

// Middleware to validate book JSON body
export async function validateBookJsonBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "POST" || req.method === "PATCH") {
    try {
      // Validate the parsed body
      const validationResult = validateRequestBody(req.body as IBook);
      if (validationResult.isValid) {
        console.log("validateBookJsonBody completed");
        next();
      } else {
        res.status(400).json({ error: validationResult.errors });
        console.log("validateBookJsonBody failed");
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON" });
      console.log("validateBookJsonBody failed", error);
    }
  } else {
    next();
  }
}

// Function to validate the request body
const validateRequestBody = (body: IBook) => {
  console.log("validating RequestBody started");
  const requiredFields = [
    { key: "title", type: "string" },
    { key: "author", type: "string" },
    { key: "publisher", type: "string" },
    { key: "genre", type: "string" },
    { key: "isbnNo", type: "number" },
    { key: "numofPages", type: "number" },
    { key: "totalNumberOfCopies", type: "number" },
  ];

  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!body.hasOwnProperty(field.key)) {
      errors.push(`${field.key} is missing`);
    } else if (typeof body[field.key] !== field.type) {
      errors.push(`${field.key} must be of type ${field.type}`);
    }
  }
  console.log("validating RequestBody completed");
  return { isValid: errors.length === 0, errors };
};

// Middleware to parse query parameters
export function parseQueryParameters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    req.query = {
      id: url.searchParams.get("id"),
      isbn: url.searchParams.get("isbn"),
      title: url.searchParams.get("title"),
    };
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid URL" });
  }
}

// Middleware to validate query parameters
export function validateQueryParameters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id, isbn, title } = req.query;
  const parameters = [id, isbn, title].filter(Boolean);

  if (parameters.length === 1) {
    next();
  } else {
    res.status(400).json({
      message:
        "Please provide exactly one search parameter (id, isbn, or title)",
    });
  }
}
