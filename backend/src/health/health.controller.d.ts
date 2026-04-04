import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getLiveness(): {
        status: string;
        timestamp: string;
    };
    getReadiness(): Promise<{
        status: string;
        checks: {
            database: string;
        };
        timestamp: string;
    }>;
}
