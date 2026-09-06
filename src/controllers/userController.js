import User from "../models/User.js";
import { signAccessToken, attachCookiesToResponse } from "../config/jwt.js";
import { validateSignup, validateLogin } from "../validation/userValidation.js";
import { errorHandler } from "../middleware/error.js";
import asyncHandler from "express-async-handler";

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = validateSignup(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const { name, email, password } = value;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: "User already exists with that email",
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Create JWT tokens
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
});

// @desc    Authenticate user and get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const { email, password } = value;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      error: "Invalid credentials",
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: "Invalid credentials",
    });
  }

  // Create JWT token
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
});

// @desc    Authenticate user and refresh token
// @route   POST /api/users/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to refresh token",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found with this refresh token",
      });
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
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
  }
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (req, res, next) => {
  // Clear access token cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Successfully logged out",
  });
});

export default { registerUser, loginUser, refreshToken, logoutUser };