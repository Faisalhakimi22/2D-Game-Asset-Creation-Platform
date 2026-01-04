import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can replace 'any' with your User type from database.types.ts
    }
  }
}