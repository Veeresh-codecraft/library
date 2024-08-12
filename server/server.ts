import express, { Request, Response, NextFunction } from "express";

// Define types similar to your original implementation
export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type RequestProcessor = (req: Request, res: Response) => void;

export class HTTPServer {
  private app: express.Express;

  constructor(private port: number) {
    this.app = express();

    // Setup middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Start the server
    this.app.listen(this.port, () => {
      console.log(`Listening at port: ${this.port}`);
    });
  }

  public get(path: string, ...middleware: Middleware[]) {
    this.app.get(path, ...middleware);
  }

  public post(path: string, ...middleware: Middleware[]) {
    this.app.post(path, ...middleware);
  }

  public delete(path: string, ...middleware: Middleware[]) {
    this.app.delete(path, ...middleware);
  }

  public patch(path: string, ...middleware: Middleware[]) {
    this.app.patch(path, ...middleware);
  }

  public useMiddleware(...middleware: Middleware[]) {
    this.app.use(...middleware);
  }

  public useMiddlewareForPath(
    method: "GET" | "POST" | "DELETE" | "PATCH",
    path: string,
    ...middleware: Middleware[]
  ) {
    switch (method) {
      case "GET":
        this.app.get(path, ...middleware);
        break;
      case "POST":
        this.app.post(path, ...middleware);
        break;
      case "DELETE":
        this.app.delete(path, ...middleware);
        break;
      case "PATCH":
        this.app.patch(path, ...middleware);
        break;
    }
  }
}
