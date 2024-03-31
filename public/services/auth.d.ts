import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/User";
export declare const verifyToken: (req: AuthenticatedRequest, res: Response, _next: NextFunction) => Response<any, Record<string, any>> | undefined;
