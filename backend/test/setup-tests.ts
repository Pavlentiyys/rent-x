import { Logger } from '@nestjs/common';

process.env.NODE_ENV = 'test';
Logger.overrideLogger(false);
