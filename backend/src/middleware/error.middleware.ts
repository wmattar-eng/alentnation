import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const code = (err as any).code;
    
    if (code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Resource already exists'
      });
    }
    
    if (code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};
