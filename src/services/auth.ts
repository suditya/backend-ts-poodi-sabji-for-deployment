import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/User";

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
) => {
  const token = req.header("Authorization");
  console.log(token, " verification token ");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, "suditya-gupta") as { email: string };
    console.log(decoded, " decoded token");
    req.email = decoded.email;
    _next();
  } catch (error) {
    console.log("invalid token", error);
    res.status(401).json(error);
  }
};
