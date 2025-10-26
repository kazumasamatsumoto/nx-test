import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersProxyController } from './proxy/users-proxy.controller';
import { ProductsProxyController } from './proxy/products-proxy.controller';
import { AuthProxyController } from './proxy/auth-proxy.controller';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      signOptions: { expiresIn: '1d' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 100, // Max requests per ttl
      },
    ]),
  ],
  controllers: [
    AppController,
    UsersProxyController,
    ProductsProxyController,
    AuthProxyController,
  ],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
