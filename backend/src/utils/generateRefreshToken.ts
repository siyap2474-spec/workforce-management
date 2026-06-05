import jwt from "jsonwebtoken";

export const generateRefreshToken = (
  id: string
): string => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};