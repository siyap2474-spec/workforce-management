import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";


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

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
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