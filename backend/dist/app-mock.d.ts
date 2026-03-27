declare const app: import("express-serve-static-core").Express;
export declare const prisma: {
    user: {
        findUnique: () => Promise<null>;
        create: (data: any) => Promise<any>;
    };
    sponsor: {
        findUnique: () => Promise<null>;
        create: (data: any) => Promise<{
            id: string;
            companyName: any;
            tier: string;
            budgetTotal: number;
            budgetSpent: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>;
        findMany: () => Promise<never[]>;
        count: () => Promise<number>;
        aggregate: () => Promise<{
            _sum: {
                budgetTotal: number;
            };
        }>;
    };
    sponsorCampaign: {
        findUnique: () => Promise<null>;
        create: (data: any) => Promise<any>;
        findMany: () => Promise<{
            id: string;
            name: string;
            type: string;
            status: string;
            headline: string;
            description: string;
            budget: number;
            impressions: number;
            clicks: number;
            conversions: number;
            sponsorId: string;
            sponsor: {
                companyName: string;
                logoUrl: null;
                tier: string;
            };
            createdAt: Date;
            updatedAt: Date;
        }[]>;
        count: () => Promise<number>;
        update: ({ where, data }: any) => Promise<{
            id: string;
            name: string;
            type: string;
            status: string;
            headline: string;
            description: string;
            budget: number;
            impressions: number;
            clicks: number;
            conversions: number;
            sponsorId: string;
            sponsor: {
                companyName: string;
                logoUrl: null;
                tier: string;
            };
            createdAt: Date;
            updatedAt: Date;
        } | undefined>;
    };
    payment: {
        findMany: () => Promise<never[]>;
    };
    auditLog: {
        create: (data: any) => Promise<any>;
    };
    $disconnect: () => Promise<void>;
};
export declare const redis: {
    get: () => Promise<null>;
    set: () => Promise<string>;
    quit: () => Promise<void>;
};
export default app;
//# sourceMappingURL=app-mock.d.ts.map