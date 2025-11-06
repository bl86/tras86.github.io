/**
 * JWT Token Utilities
 * Token generation and verification
 */

import jwt, { SignOptions } from 'jsonwebtoken';
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

  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };

  return jwt.sign(payload, config.jwt.secret, options);
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

  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as any,
  };

  return jwt.sign(payload, config.jwt.refreshSecret, options);
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
