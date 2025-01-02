export interface AppConfig {
  port: number;
  host: string;
  node_env: string;
  app_name: string;
  db_connection: string;
}

export interface DockerConfig {
  container_name: string;
  container_timezone: string;
}

export interface MongodbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  db_name: string;
  database_url: string;
}

export interface RedisConfig {
  version: string;
  host: string;
  port: number;
  url: string;
  password: string;
}

export interface KafkaConfig {
  host: string;
  version: string;
  client_port: number;
  external_port: number;
  broker_id: number;
  num_partitions: number;
  broker: string;
  ui_port: number;
}

export interface AwsConfig {
  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
    endpoint: string;
    cdn_url: string;
  };
}

interface EmailConfig {
  resendApiKey: string;
}

export interface AuthConfig {
  jwtSecretUser: string;
}

export interface Configuration {
  app: AppConfig;
  docker: DockerConfig;
  mongodb: MongodbConfig;
  redis: RedisConfig;
  kafka: KafkaConfig;
  aws: AwsConfig;
  email: EmailConfig;
  auth: AuthConfig;
}

export default (): Configuration => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    node_env: process.env.NODE_ENV || 'development',
    app_name: process.env.APP_NAME || 'ChatAPI',
    db_connection: process.env.DB_CONNECTION || 'mongodb',
  },
  docker: {
    container_name: process.env.CONTAINER_NAME || 'chat-api',
    container_timezone: process.env.CONTAINER_TIMEZONE || 'America/Sao_Paulo',
  },
  mongodb: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: parseInt(process.env.MONGODB_PORT || '27017', 10),
    user: process.env.MONGODB_USER || 'chat-api',
    password: process.env.MONGODB_PASSWORD || 'chat-api',
    db_name: process.env.MONGODB_DB_NAME || 'chat-api_db_development',
    database_url:
      process.env.DATABASE_URL ||
      'mongodb://localhost:27017/chat-api_db_development',
  },
  redis: {
    version: process.env.REDIS_VERSION || 'latest',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    url: process.env.REDIS_URL || 'redis://redis:6379',
    password: process.env.REDIS_PASSWORD || 'supersecret',
  },
  kafka: {
    host: process.env.KAFKA_HOST || 'localhost',
    version: process.env.KAFKA_VERSION || 'latest',
    client_port: parseInt(process.env.KAFKA_CLIENT_PORT || '9092', 10),
    external_port: parseInt(process.env.KAFKA_EXTERNAL_PORT || '9093', 10),
    broker_id: parseInt(process.env.KAFKA_BROKER_ID || '1', 10),
    num_partitions: parseInt(process.env.KAFKA_NUM_PARTITIONS || '1', 10),
    broker: process.env.KAFKA_BROKER || 'localhost:9092',
    ui_port: parseInt(process.env.KAFKA_UI_PORT || '8080', 10),
  },
  aws: {
    s3: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || 'xVGpVQydyul0FeidetEg',
      secretAccessKey:
        process.env.AWS_S3_SECRET_ACCESS_KEY ||
        'zEXV5QQGuRKTTzDRac2vQ2d8OkRw0YtIb6l6t0De',
      region: process.env.AWS_S3_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'chat-api',
      endpoint: process.env.AWS_S3_ENDPOINT || 'http://minio:9000',
      cdn_url: process.env.AWS_S3_CDN_URL || 'http://localhost:9000',
    },
  },
  email: {
    resendApiKey: process.env.EMAIL_RESEND_API_KEY || 'api_key',
  },
  auth: {
    jwtSecretUser: process.env.JWT_SECRET_USER || 'a',
  },
});
