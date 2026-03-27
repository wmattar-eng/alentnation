interface Project {
    id: string;
    title: string;
    description: string;
    skillsRequired: string[];
    budgetMin?: number;
    budgetMax?: number;
    projectType: string;
    duration?: string;
    experienceLevel: string;
}
interface MatchResult {
    talentId: string;
    score: number;
    reasons: string[];
}
export declare function findMatchingTalent(project: Project, options?: {
    limit?: number;
    minScore?: number;
}): Promise<MatchResult[]>;
export declare function findMatchingProjects(talentId: string, options?: {
    limit?: number;
    minScore?: number;
}): Promise<MatchResult[]>;
export declare function autoInviteTalent(projectId: string, maxInvites?: number): Promise<number>;
declare const _default: {
    findMatchingTalent: typeof findMatchingTalent;
    findMatchingProjects: typeof findMatchingProjects;
    autoInviteTalent: typeof autoInviteTalent;
};
export default _default;
//# sourceMappingURL=ai-matching.service.d.ts.map