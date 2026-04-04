import { DataSource } from 'typeorm';
export declare class HealthService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
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
