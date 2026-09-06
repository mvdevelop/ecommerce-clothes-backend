import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

export interface IJwtPayload {
  id: string;
}

export const signAccessToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, options);
};

export const signRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET as string, options);
};

export const verifyToken = (token: string): IJwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as IJwtPayload;
};

export const attachCookiesToResponse = (
  res: Response,
  user: { _id: { toString(): string } }
): void => {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const createJWT = (userId: string): string => {
  return signAccessToken(userId);
};