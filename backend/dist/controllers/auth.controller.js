"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../app");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
exports.authController = {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, role } = req.body;
            // Check if user exists
            const existingUser = await app_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already registered'
                });
            }
            // Hash password
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            // Create user
            const user = await app_1.prisma.user.create({
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
                await app_1.prisma.talentProfile.create({
                    data: {
                        userId: user.id
                    }
                });
            }
            else if (role === 'CLIENT') {
                await app_1.prisma.clientProfile.create({
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Find user
            const user = await app_1.prisma.user.findUnique({
                where: { email }
            });
            if (!user || !user.passwordHash) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }
            // Verify password
            const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }
            // Update last login
            await app_1.prisma.user.update({
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },
    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: 'No refresh token provided'
                });
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
            const tokens = generateTokens(decoded.userId, decoded.email, decoded.role);
            res.json({
                success: true,
                data: tokens
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }
    },
    async logout(req, res) {
        // In a more complex setup, you might blacklist the token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    },
    async forgotPassword(req, res) {
        // TODO: Implement password reset email
        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    },
    async resetPassword(req, res) {
        // TODO: Implement password reset
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    },
    async googleAuth(req, res) {
        // TODO: Implement Google OAuth
        res.json({
            success: true,
            message: 'Google OAuth not implemented yet'
        });
    },
    async googleCallback(req, res) {
        // TODO: Implement Google OAuth callback
        res.json({
            success: true,
            message: 'Google OAuth callback not implemented yet'
        });
    }
};
function generateTokens(userId, email, role) {
    const accessToken = jsonwebtoken_1.default.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, email, role }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
    return {
        accessToken,
        refreshToken,
        expiresIn: JWT_ACCESS_EXPIRY
    };
}
//# sourceMappingURL=auth.controller.js.map