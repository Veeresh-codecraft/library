import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

// Request Logger Middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const logMessage = `${req.method},${req.originalUrl},${req.headers.host}\n`;

  // Define the path to the logs.csv file
  const logFilePath = path.join(__dirname, "logs.csv");

  // Append the log message to logs.csv
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    } else {
      console.log("Request logged to logs.csv");
    }
  });

  console.log("Request Logger completed");
  next();
}

// CORS Handler Middleware
export function corsHandler(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    console.log("CORS completed");
    next();
  }
}

// Parse JSON body for POST or PATCH requests
export function parseBody(req: Request, res: Response, next: NextFunction) {
  if (req.method === "POST" || req.method === "PATCH") {
    let bodyData = "";

    req.on("data", (chunk) => {
      bodyData += chunk.toString();
    });

    req.on("end", () => {
      try {
        req.body = JSON.parse(bodyData);
        console.log("parseBody completed");
        next();
      } catch (error) {
        console.log("parseBody failed");
        res.status(400).json({ error: "Invalid JSON" });
      }
    });

    // If there's an error while reading data
    req.on("error", () => {
      res.status(400).json({ error: "Failed to parse body" });
    });
  } else {
    next();
  }
}
