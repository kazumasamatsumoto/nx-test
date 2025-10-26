import { Controller, All, Get, Post, Put, Delete, Patch, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthProxyController {
  private readonly userServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') || 'http://localhost:3001';
  }

  @All('*path')
  @All()
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      // req.url includes the path after /auth, e.g., /register or /login
      // Remove the leading /api/auth from req.url since we're already under @Controller('auth')
      const path = req.url.startsWith('/api/auth') ? req.url.substring(9) : req.url;
      const url = `${this.userServiceUrl}/api/auth${path}`;

      console.log(`[Auth Proxy] ${req.method} ${url}`);

      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url,
          data: req.body,
          headers: {
            'content-type': req.headers['content-type'],
          },
          timeout: 5000,
        })
      );

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error('[Auth Proxy] Error:', error.message);
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: 'Internal server error' };
      res.status(status).json(data);
    }
  }
}
