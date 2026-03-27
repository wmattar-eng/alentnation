"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Registration
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    (0, express_validator_1.body)('firstName').trim().notEmpty(),
    (0, express_validator_1.body)('lastName').trim().notEmpty(),
    (0, express_validator_1.body)('role').isIn(['TALENT', 'CLIENT']),
    validate_middleware_1.validate
], auth_controller_1.authController.register);
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
    validate_middleware_1.validate
], auth_controller_1.authController.login);
// Refresh token
router.post('/refresh', auth_controller_1.authController.refresh);
// Logout
router.post('/logout', auth_controller_1.authController.logout);
// Forgot password
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    validate_middleware_1.validate
], auth_controller_1.authController.forgotPassword);
// Reset password
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    validate_middleware_1.validate
], auth_controller_1.authController.resetPassword);
// Google OAuth
router.get('/google', auth_controller_1.authController.googleAuth);
router.get('/google/callback', auth_controller_1.authController.googleCallback);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map