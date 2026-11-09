import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService} from '@nestjs/config';
import { ProductModule } from './product/product.module.js';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "./product/entities/product.entity.js";
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import keyvRedis from '@keyv/redis';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'product-service',
    }),

    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Product],
        migrations: ['dist/migrations/*.js'],
        synchronize: false,
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: new Keyv({
          store: new keyvRedis(config.get('REDIS_URL')),
          namespace: 'product-service',
        }),
        ttl: Number(config.get('CACHE_TTL')),
      }),
    }),

    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
