"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const code = err.code;
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map