import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness() {
    await this.dataSource.query('SELECT 1');

    return {
      status: 'ok',
      checks: {
        database: 'up',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
