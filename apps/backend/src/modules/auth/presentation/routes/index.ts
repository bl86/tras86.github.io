/**
 * Authentication Routes
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';

export const authRouter = Router();

/**
 * Public routes
 */
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

/**
 * Protected routes
 */
authRouter.get('/me', authenticate, authController.getCurrentUser);
authRouter.post('/change-password', authenticate, authController.changePassword);
