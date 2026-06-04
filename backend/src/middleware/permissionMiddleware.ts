import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { IRole } from "../models/Role";

export const authorizePermission =
  (...permissions: string[]) =>
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

    const role = req.user.role as IRole;
    console.log(req.user);

    const hasPermission = permissions.some(
      (permission) =>
        role.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    next();
  };