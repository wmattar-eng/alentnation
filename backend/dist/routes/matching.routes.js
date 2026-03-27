"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const ai_matching_service_1 = __importDefault(require("../services/ai-matching.service"));
const router = (0, express_1.Router)();
// Find matching talent for a project (client view)
router.get('/projects/:id/talent', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { limit = '10', minScore = '50' } = req.query;
        // Get project details
        const project = await req.prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                skills: {
                    include: { skill: true },
                },
            },
        });
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        // Verify ownership
        if (project.clientId !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        const matches = await ai_matching_service_1.default.findMatchingTalent({
            id: project.id,
            title: project.title,
            description: project.description,
            skillsRequired: project.skills.map((s) => s.skill.name),
            budgetMin: project.budgetMin ? Number(project.budgetMin) : undefined,
            budgetMax: project.budgetMax ? Number(project.budgetMax) : undefined,
            projectType: project.projectType,
            duration: project.duration || undefined,
            experienceLevel: project.experienceLevel,
        }, {
            limit: parseInt(limit),
            minScore: parseInt(minScore),
        });
        // Fetch full talent details
        const talentDetails = await req.prisma.talentProfile.findMany({
            where: {
                userId: { in: matches.map((m) => m.talentId) },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                skills: {
                    include: { skill: true },
                },
            },
        });
        // Combine match scores with talent details
        const results = matches.map((match) => ({
            ...match,
            talent: talentDetails.find((t) => t.userId === match.talentId),
        }));
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// Find matching projects for a talent
router.get('/talent/projects', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { limit = '10', minScore = '50' } = req.query;
        const matches = await ai_matching_service_1.default.findMatchingProjects(req.user.id, {
            limit: parseInt(limit),
            minScore: parseInt(minScore),
        });
        // Fetch full project details
        const projectDetails = await req.prisma.project.findMany({
            where: {
                id: { in: matches.map((m) => m.talentId) },
                status: 'OPEN',
            },
            include: {
                skills: {
                    include: { skill: true },
                },
                client: {
                    select: {
                        companyName: true,
                        verified: true,
                    },
                },
            },
        });
        // Combine match scores with project details
        const results = matches.map((match) => ({
            ...match,
            project: projectDetails.find((p) => p.id === match.talentId),
        }));
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// Auto-invite top talent to a project
router.post('/projects/:id/invite', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { maxInvites = 5 } = req.body;
        // Verify project ownership
        const project = await req.prisma.project.findUnique({
            where: { id: req.params.id },
        });
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        if (project.clientId !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        const invitedCount = await ai_matching_service_1.default.autoInviteTalent(req.params.id, maxInvites);
        res.json({
            success: true,
            data: {
                invited: invitedCount,
                message: `${invitedCount} top-matched talent invited`,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=matching.routes.js.map