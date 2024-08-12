import { Request, Response, NextFunction } from "express";

// Middleware to validate user JSON body
export async function validateUserJsonBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "POST" || req.method === "PATCH") {
    try {
      // Validate the parsed body
      const validationResult = validateRequestBody(req.body);
      if (validationResult.isValid) {
        console.log("validateUserJsonBody completed");
        next();
      } else {
        res.status(400).json({ error: validationResult.errors });
        console.log("validateUserJsonBody failed");
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON by validateUserJsonBody" });
      console.log("validateUserJsonBody failed", error);
    }
  } else {
    next();
  }
}

// Function to validate the request body
const validateRequestBody = (body: any) => {
  console.log("validating RequestBody started");
  const requiredFields = [
    { key: "name", type: "string" },
    { key: "age", type: "number" },
    { key: "DOB", type: "string" }, // Date should be a string or Date object
    { key: "address", type: "string" },
    { key: "phoneNum", type: "number" },
    { key: "password", type: "string" },
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
