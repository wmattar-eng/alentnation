import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import matchingService from '../services/ai-matching.service';

const router = Router();

// Find matching talent for a project (client view)
router.get('/projects/:id/talent', authMiddleware, async (req, res) => {
  try {
    const { limit = '10', minScore = '50' } = req.query;

    // Get project details
    const project = await (req as any).prisma.project.findUnique({
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
    if (project.clientId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const matches = await matchingService.findMatchingTalent(
      {
        id: project.id,
        title: project.title,
        description: project.description,
        skillsRequired: project.skills.map((s: any) => s.skill.name),
        budgetMin: project.budgetMin ? Number(project.budgetMin) : undefined,
        budgetMax: project.budgetMax ? Number(project.budgetMax) : undefined,
        projectType: project.projectType,
        duration: project.duration || undefined,
        experienceLevel: project.experienceLevel,
      },
      {
        limit: parseInt(limit as string),
        minScore: parseInt(minScore as string),
      }
    );

    // Fetch full talent details
    const talentDetails = await (req as any).prisma.talentProfile.findMany({
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
      talent: talentDetails.find((t: any) => t.userId === match.talentId),
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Find matching projects for a talent
router.get('/talent/projects', authMiddleware, async (req, res) => {
  try {
    const { limit = '10', minScore = '50' } = req.query;

    const matches = await matchingService.findMatchingProjects(req.user!.id, {
      limit: parseInt(limit as string),
      minScore: parseInt(minScore as string),
    });

    // Fetch full project details
    const projectDetails = await (req as any).prisma.project.findMany({
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
      project: projectDetails.find((p: any) => p.id === match.talentId),
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Auto-invite top talent to a project
router.post('/projects/:id/invite', authMiddleware, async (req, res) => {
  try {
    const { maxInvites = 5 } = req.body;

    // Verify project ownership
    const project = await (req as any).prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.clientId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const invitedCount = await matchingService.autoInviteTalent(
      req.params.id,
      maxInvites
    );

    res.json({
      success: true,
      data: {
        invited: invitedCount,
        message: `${invitedCount} top-matched talent invited`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
