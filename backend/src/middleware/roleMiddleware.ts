import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { IRole } from "../models/Role";

export const authorize =
  (...roles: string[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (
      !roles.includes(
        (req.user.role as IRole).name
      ) 
    ){
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };