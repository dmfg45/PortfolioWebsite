import type { NextFunction, Request, Response } from "express";
import { config } from "../lib/config.js";

// Express recognizes error-handling middleware by its four-argument arity.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (config.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(500).json({ error: "Internal server error" });
}
