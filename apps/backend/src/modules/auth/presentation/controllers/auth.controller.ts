/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from 'express';
import { AuthService } from '../../application/auth.service';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../dtos/auth.dto';

const authService = new AuthService();

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data);

  res.status(201).json({
    status: 'success',
    data: result,
  });
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data);

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  await authService.logout(refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId;
  const user = await authService.getCurrentUser(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId;
  const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

  await authService.changePassword(userId, oldPassword, newPassword);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
};
