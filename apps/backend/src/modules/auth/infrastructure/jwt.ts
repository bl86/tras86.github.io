/**
 * JWT Token Utilities
 * Token generation and verification
 */

import jwt from 'jsonwebtoken';
import { config } from '@/config/config';
import { User } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify token
 */
export const verifyToken = (
  token: string,
  isRefreshToken: boolean = false
): TokenPayload => {
  const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.secret;

  return jwt.verify(token, secret) as TokenPayload;
};
