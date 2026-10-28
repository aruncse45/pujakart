import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Product } from './src/product/entities/product.entities.js';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Product],
  migrations: ['dist/migrations/*.ts'],
});