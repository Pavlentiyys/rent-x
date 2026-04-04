"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
function validateEnvironment(config) {
    const requiredKeys = [
        'JWT_SECRET',
        'DATABASE_HOST',
        'DATABASE_PORT',
        'DATABASE_NAME',
        'DATABASE_USER',
        'DATABASE_PASSWORD',
        'MINIO_ENDPOINT',
        'MINIO_INTERNAL_PORT',
        'MINIO_ACCESS_KEY',
        'MINIO_SECRET_KEY',
        'MINIO_BUCKET',
        'SOLANA_RPC_URL',
    ];
    for (const key of requiredKeys) {
        const value = config[key]?.trim();
        if (!value) {
            throw new Error(`Environment variable ${key} is required`);
        }
    }
    validatePort(config, 'PORT');
    validatePort(config, 'DATABASE_PORT');
    validatePort(config, 'MINIO_INTERNAL_PORT');
    validateBoolean(config, 'DATABASE_SYNCHRONIZE');
    validateBoolean(config, 'MINIO_USE_SSL');
    return config;
}
function validatePort(config, key) {
    const value = config[key];
    if (!value) {
        return;
    }
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Environment variable ${key} must be a valid port number`);
    }
}
function validateBoolean(config, key) {
    const value = config[key];
    if (!value) {
        return;
    }
    if (!['true', 'false'].includes(value)) {
        throw new Error(`Environment variable ${key} must be either "true" or "false"`);
    }
}
//# sourceMappingURL=environment.validation.js.map