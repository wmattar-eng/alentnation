import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      // Create profile based on role
      if (role === 'TALENT') {
        await prisma.talentProfile.create({
          data: {
            userId: user.id
          }
        });
      } else if (role === 'CLIENT') {
        await prisma.clientProfile.create({
          data: {
            userId: user.id
          }
        });
      }

      // Generate tokens
      const tokens = generateTokens(user.id, user.email, user.role);

      res.status(201).json({
        success: true,
        data: {
          user,
          ...tokens
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const tokens = generateTokens(user.id, user.email, user.role);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          ...tokens
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'No refresh token provided'
        });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      const tokens = generateTokens(decoded.userId, decoded.email, decoded.role);

      res.json({
        success: true,
        data: tokens
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  },

  async logout(req: Request, res: Response) {
    // In a more complex setup, you might blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  async forgotPassword(req: Request, res: Response) {
    // TODO: Implement password reset email
    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  },

  async resetPassword(req: Request, res: Response) {
    // TODO: Implement password reset
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  },

  async googleAuth(req: Request, res: Response) {
    // TODO: Implement Google OAuth
    res.json({
      success: true,
      message: 'Google OAuth not implemented yet'
    });
  },

  async googleCallback(req: Request, res: Response) {
    // TODO: Implement Google OAuth callback
    res.json({
      success: true,
      message: 'Google OAuth callback not implemented yet'
    });
  }
};

function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_ACCESS_EXPIRY
  };
}
