// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LocationsModule } from './locations/locations.module';
import { CategoriesModule } from './categories/categories.module';
import { FoodItemsModule } from './food-items/food-items.module';
import { OrdersModule } from './orders/orders.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { AuthModule } from './auth/auth.module';
import { PincodesModule } from './pincodes/pincodes.module';
import { HomeSlidersModule } from './home-sliders/home-sliders.module';
import { PublicUser } from './public-users/public-user.entity';
import { PublicAuthModule } from './public-auth/public-auth.module';
import { OffersModule } from './offers/offers.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PublicUsersModule } from './public-users/public-users.module';
import { AppDataSource } from './data-source';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options = AppDataSource.options as any;
        const host = configService.get('DB_HOST') || options.host;
        const port = configService.get('DB_PORT') || options.port;
        console.log(`🔌 Initializing database connection to ${host}:${port}`);
        if (!configService.get('DB_HOST')) {
          console.warn('⚠️ WARNING: DB_HOST not found in environment, using fallback!');
        }
        return {
          ...options,
          host,
          port: parseInt(port),
        };
      },
    }),
    LocationsModule,
    CategoriesModule,
    FoodItemsModule,
    OrdersModule,
    QrCodesModule,
    AuthModule,
    PincodesModule,
    HomeSlidersModule,
    PublicAuthModule,
    OffersModule,
    WishlistModule,
    PublicUsersModule,
  ],
})
export class AppModule { }
