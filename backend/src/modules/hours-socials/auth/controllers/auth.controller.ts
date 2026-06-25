import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.register(req.body ?? {});
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.login(req.body ?? {});
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
}

const authController = new AuthController();

export const registerController = authController.register;
export const loginController = authController.login;
export default AuthController;