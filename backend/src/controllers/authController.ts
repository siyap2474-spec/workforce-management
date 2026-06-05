import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail";
import { generateRefreshToken } from "../utils/generateRefreshToken";
import jwt from "jsonwebtoken";


import Role from "../models/Role";

//register
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, roleId } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      res.status(400).json({
        message: "Invalid role ID format",
      });
      return;
    }

    const role = await Role.findById(roleId);

    if (!role) {
      res.status(400).json({
        message: "Invalid role",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationTokenExpires = new Date(
      Date.now() + 1000 * 60 * 60 // 1 hour
    );



    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roleId,
      verificationToken,
      verificationTokenExpires,
    });

    const verificationUrl =
      `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    await sendEmail(
      user.email,
      "Verify Your Email",
      `
    <h2>Welcome to Workforce Management</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationUrl}">
      Verify Email
    </a>
  `
    );

    const populatedUser = await User.findById(user._id)
      .populate("role");

    res.status(201).json({
      _id: populatedUser?._id,
      name: populatedUser?.name,
      email: populatedUser?.email,
      role: populatedUser?.role,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//login
export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        message: "Please verify your email first",
      });
      return;
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const refreshToken = generateRefreshToken(
      user._id.toString()
    );

    user.refreshToken = refreshToken;

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: generateToken(
        user._id.toString()
      ),
      refreshToken,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//verifyEmail
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      res.status(400).json({
        message: "Invalid or expired token",
      });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

//forgot password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const resetPasswordToken = crypto
      .randomBytes(32)
      .toString("hex");

    const resetPasswordExpires = new Date(
      Date.now() + 1000 * 60 * 60
    ); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    const resetUrl =
      `http://localhost:5173/reset-password/${resetPasswordToken}`;

    await sendEmail(
      user.email,
      "Reset Your Password",
      `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">
      Reset Password
    </a>
  `
    );

    res.status(200).json({
      message: "Password reset email sent",
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//reset password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      res.status(400).json({
        message: "Invalid or expired token",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//refresh token 
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        message: "Refresh token required",
      });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    if (user.refreshToken !== refreshToken) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    const accessToken = generateToken(
      user._id.toString()
    );

    res.status(200).json({
      accessToken,
    });

  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

//logout
export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      refreshToken,
    });

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};