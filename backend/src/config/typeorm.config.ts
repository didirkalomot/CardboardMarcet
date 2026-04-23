import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

console.log('=== TypeORM Config Debug ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('=============================');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'cardmarket',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};
