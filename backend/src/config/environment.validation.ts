type Environment = Record<string, string | undefined>;

export function validateEnvironment(config: Environment) {
  const normalizedConfig = {
    PORT: '3000',
    DATABASE_SYNCHRONIZE: 'true',
    MINIO_USE_SSL: 'false',
    SOLANA_RPC_URL: 'https://api.devnet.solana.com',
    SOLANA_COMMITMENT: 'confirmed',
    ...config,
  };

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
  ];

  for (const key of requiredKeys) {
    const value = normalizedConfig[key]?.trim();

    if (!value) {
      throw new Error(`Environment variable ${key} is required`);
    }
  }

  validatePort(normalizedConfig, 'PORT');
  validatePort(normalizedConfig, 'DATABASE_PORT');
  validatePort(normalizedConfig, 'MINIO_INTERNAL_PORT');

  validateBoolean(normalizedConfig, 'DATABASE_SYNCHRONIZE');
  validateBoolean(normalizedConfig, 'MINIO_USE_SSL');

  return normalizedConfig;
}

function validatePort(config: Environment, key: string) {
  const value = config[key];

  if (!value) {
    return;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Environment variable ${key} must be a valid port number`);
  }
}

function validateBoolean(config: Environment, key: string) {
  const value = config[key];

  if (!value) {
    return;
  }

  if (!['true', 'false'].includes(value)) {
    throw new Error(`Environment variable ${key} must be either "true" or "false"`);
  }
}
