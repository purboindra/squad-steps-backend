import type { NextFunction, Request, Response } from "express";

export const requireBody = () => (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is required.", data: null });
    return;
  }
  next();
};
