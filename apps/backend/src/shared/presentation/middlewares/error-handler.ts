/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/infrastructure/logger';
import { AppError } from '@/shared/domain/errors/app-error';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // AppError (custom application errors)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Default error
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack,
    }),
  });
};

/**
 * Handle Prisma specific errors
 */
const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      return res.status(409).json({
        status: 'error',
        message: 'Record already exists',
        code: 'DUPLICATE_RECORD',
        field: (error.meta?.target as string[]) || [],
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        status: 'error',
        message: 'Record not found',
        code: 'NOT_FOUND',
      });

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reference',
        code: 'INVALID_REFERENCE',
      });

    default:
      return res.status(500).json({
        status: 'error',
        message: 'Database error',
        code: 'DATABASE_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          prismaCode: error.code,
          prismaMessage: error.message,
        }),
      });
  }
};
