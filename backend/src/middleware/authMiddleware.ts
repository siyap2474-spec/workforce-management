import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

interface JwtPayload {
  id: string;
}


export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      req.user = await User.findById(decoded.id)
        .populate("role")
        .select("-password");


      if (!req.user) {

        res.status(401).json({
          message: "User not found"
        });

        return;
      }


      next();
    } else {
      res.status(401).json({
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "Token failed",
    });
  }
};