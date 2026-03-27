"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingTalent = findMatchingTalent;
exports.findMatchingProjects = findMatchingProjects;
exports.autoInviteTalent = autoInviteTalent;
const app_1 = require("../app");
// Calculate skill match score (0-100)
function calculateSkillMatch(projectSkills, talentSkills) {
    if (projectSkills.length === 0)
        return 50; // Neutral if no skills specified
    const matchingSkills = projectSkills.filter(skill => talentSkills.some(ts => ts.toLowerCase() === skill.toLowerCase()));
    return (matchingSkills.length / projectSkills.length) * 100;
}
// Calculate budget match score (0-100)
function calculateBudgetMatch(projectBudgetMin, projectBudgetMax, talentHourlyRate) {
    if (!projectBudgetMin && !projectBudgetMax)
        return 50;
    const min = projectBudgetMin || 0;
    const max = projectBudgetMax || min * 2;
    const avgBudget = (min + max) / 2;
    // If talent rate is within budget range, perfect match
    if (talentHourlyRate >= min && talentHourlyRate <= max) {
        return 100;
    }
    // Calculate how far off they are
    const diff = Math.abs(talentHourlyRate - avgBudget);
    const range = max - min || avgBudget;
    // Score decreases as rate deviates from budget
    const score = Math.max(0, 100 - (diff / range) * 50);
    return score;
}
// Calculate experience match (0-100)
function calculateExperienceMatch(requiredLevel, talentYears, completedProjects) {
    const levelRequirements = {
        ENTRY: { minYears: 0, minProjects: 0 },
        JUNIOR: { minYears: 1, minProjects: 3 },
        MID: { minYears: 3, minProjects: 10 },
        SENIOR: { minYears: 5, minProjects: 20 },
        EXPERT: { minYears: 8, minProjects: 30 },
    };
    const req = levelRequirements[requiredLevel] || levelRequirements.MID;
    // Check if meets minimum requirements
    const meetsYears = talentYears >= req.minYears;
    const meetsProjects = completedProjects >= req.minProjects;
    if (meetsYears && meetsProjects)
        return 100;
    if (meetsYears || meetsProjects)
        return 70;
    // Calculate partial match
    const yearScore = Math.min(100, (talentYears / req.minYears) * 100);
    const projectScore = Math.min(100, (completedProjects / req.minProjects) * 100);
    return (yearScore + projectScore) / 2;
}
// Calculate availability match (0-100)
function calculateAvailabilityMatch(projectDuration, talentAvailability) {
    const availabilityScores = {
        FULL_TIME: 100,
        PART_TIME: 70,
        WEEKENDS: 40,
        LIMITED: 20,
        NOT_AVAILABLE: 0,
    };
    return availabilityScores[talentAvailability] || 50;
}
// Calculate reputation score (0-100)
function calculateReputationScore(averageRating, completedProjects, totalEarnings) {
    // Rating component (40% weight)
    const ratingScore = (averageRating / 5) * 40;
    // Projects component (30% weight) - logarithmic scale
    const projectScore = Math.min(30, Math.log10(completedProjects + 1) * 10);
    // Earnings component (30% weight) - logarithmic scale
    const earningsScore = Math.min(30, Math.log10(totalEarnings / 1000 + 1) * 10);
    return ratingScore + projectScore + earningsScore;
}
// Main matching algorithm
async function findMatchingTalent(project, options = {}) {
    const { limit = 10, minScore = 50 } = options;
    // Fetch all active talent profiles
    const talents = await app_1.prisma.talentProfile.findMany({
        where: {
            user: {
                status: 'ACTIVE',
            },
            isAvailable: true,
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
                include: {
                    skill: true,
                },
            },
        },
    });
    const matches = [];
    for (const talent of talents) {
        const skillNames = talent.skills.map((s) => s.skill.name);
        // Calculate individual scores
        const skillScore = calculateSkillMatch(project.skillsRequired, skillNames);
        const budgetScore = calculateBudgetMatch(project.budgetMin, project.budgetMax, talent.hourlyRate || 0);
        const experienceScore = calculateExperienceMatch(project.experienceLevel, talent.yearsExperience, talent.completedProjects);
        const availabilityScore = calculateAvailabilityMatch(project.duration, talent.availability);
        const reputationScore = calculateReputationScore(talent.averageRating || 0, talent.completedProjects, Number(talent.totalEarnings) || 0);
        // Weighted total score
        const totalScore = Math.round(skillScore * 0.35 + // 35% - Skills match
            budgetScore * 0.20 + // 20% - Budget alignment
            experienceScore * 0.20 + // 20% - Experience level
            availabilityScore * 0.10 + // 10% - Availability
            reputationScore * 0.15 // 15% - Past performance
        );
        if (totalScore >= minScore) {
            const reasons = [];
            if (skillScore >= 80)
                reasons.push('Strong skill match');
            if (skillScore >= 60 && skillScore < 80)
                reasons.push('Good skill match');
            if (budgetScore === 100)
                reasons.push('Within budget');
            if (experienceScore === 100)
                reasons.push('Experience level matched');
            if (reputationScore >= 70)
                reasons.push('Highly rated');
            if (talent.completedProjects >= 10)
                reasons.push('Proven track record');
            matches.push({
                talentId: talent.userId,
                score: totalScore,
                reasons: reasons.length > 0 ? reasons : ['General match'],
            });
        }
    }
    // Sort by score descending and limit results
    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
// Find matching projects for a talent
async function findMatchingProjects(talentId, options = {}) {
    const { limit = 10, minScore = 50 } = options;
    // Get talent profile
    const talent = await app_1.prisma.talentProfile.findUnique({
        where: { userId: talentId },
        include: {
            skills: {
                include: {
                    skill: true,
                },
            },
        },
    });
    if (!talent) {
        throw new Error('Talent profile not found');
    }
    // Fetch open projects
    const projects = await app_1.prisma.project.findMany({
        where: {
            status: 'OPEN',
        },
        include: {
            skills: {
                include: {
                    skill: true,
                },
            },
            client: {
                select: {
                    companyName: true,
                    verified: true,
                },
            },
        },
    });
    const skillNames = talent.skills.map((s) => s.skill.name);
    const matches = [];
    for (const project of projects) {
        const projectSkillNames = project.skills.map((s) => s.skill.name);
        const skillScore = calculateSkillMatch(projectSkillNames, skillNames);
        const budgetScore = calculateBudgetMatch(project.budgetMin ? Number(project.budgetMin) : undefined, project.budgetMax ? Number(project.budgetMax) : undefined, talent.hourlyRate || 0);
        const experienceScore = calculateExperienceMatch(project.experienceLevel, talent.yearsExperience, talent.completedProjects);
        const totalScore = Math.round(skillScore * 0.50 + // 50% - Skills (higher for talent view)
            budgetScore * 0.25 + // 25% - Budget
            experienceScore * 0.25 // 25% - Experience
        );
        if (totalScore >= minScore) {
            const reasons = [];
            if (skillScore >= 80)
                reasons.push('Skills align perfectly');
            if (budgetScore === 100)
                reasons.push('Rate fits budget');
            if (project.client?.verified)
                reasons.push('Verified client');
            if (project.urgent)
                reasons.push('Urgent project');
            matches.push({
                talentId: project.id, // Using talentId field for projectId
                score: totalScore,
                reasons: reasons.length > 0 ? reasons : ['Good match'],
            });
        }
    }
    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
// Auto-invite top matches to a project
async function autoInviteTalent(projectId, maxInvites = 5) {
    const project = await app_1.prisma.project.findUnique({
        where: { id: projectId },
        include: {
            skills: {
                include: {
                    skill: true,
                },
            },
        },
    });
    if (!project) {
        throw new Error('Project not found');
    }
    const projectData = {
        id: project.id,
        title: project.title,
        description: project.description,
        skillsRequired: project.skills.map((s) => s.skill.name),
        budgetMin: project.budgetMin ? Number(project.budgetMin) : undefined,
        budgetMax: project.budgetMax ? Number(project.budgetMax) : undefined,
        projectType: project.projectType,
        duration: project.duration || undefined,
        experienceLevel: project.experienceLevel,
    };
    const matches = await findMatchingTalent(projectData, {
        limit: maxInvites,
        minScore: 70, // Higher threshold for auto-invites
    });
    // Create notifications for top matches
    for (const match of matches) {
        await app_1.prisma.notification.create({
            data: {
                userId: match.talentId,
                type: 'PROJECT_INVITE',
                title: 'Project Match',
                body: `You were matched with "${project.title}" (${match.score}% match)`,
                data: {
                    projectId: project.id,
                    matchScore: match.score,
                    reasons: match.reasons,
                },
            },
        });
    }
    return matches.length;
}
exports.default = {
    findMatchingTalent,
    findMatchingProjects,
    autoInviteTalent,
};
//# sourceMappingURL=ai-matching.service.js.map