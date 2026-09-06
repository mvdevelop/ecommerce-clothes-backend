import { Response } from "express";
import User from "../models/User.js";
import { attachCookiesToResponse } from "../config/jwt.js";
import { validateSignup, validateLogin } from "../validation/userValidation.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
export const registerUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { error, value } = validateSignup(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const { name, email, password } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User already exists with that email",
      });
      return;
    }

    const user = await User.create({ name, email, password });

    const token = user.getSignedJwtToken();
    attachCookiesToResponse(res, user);

    res.status(201).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }
);

// @desc    Authenticate user and get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { error, value } = validateLogin(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    const token = user.getSignedJwtToken();
    attachCookiesToResponse(res, user);

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }
);

// @desc    Authenticate user and refresh token
// @route   POST /api/users/refresh
// @access  Public
export const refreshToken = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const refreshTokenFromCookie = req.cookies?.refreshToken;

    if (!refreshTokenFromCookie) {
      res.status(401).json({
        success: false,
        error: "Not authorized to refresh token",
      });
      return;
    }

    try {
      const { verifyToken: verify } = await import("../config/jwt.js");
      const decoded = verify(refreshTokenFromCookie);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401).json({
          success: false,
          error: "User not found with this refresh token",
        });
        return;
      }

      const token = user.getSignedJwtToken();
      attachCookiesToResponse(res, user);

      res.status(200).json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch {
      res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }
  }
);

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (
  _req: AuthRequest,
  res: Response
): void => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Successfully logged out",
  });
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export default { registerUser, loginUser, refreshToken, logoutUser, getMe };