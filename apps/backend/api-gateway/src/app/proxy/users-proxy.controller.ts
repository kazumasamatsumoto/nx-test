import { Controller, All, Get, Post, Put, Delete, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersProxyController {
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
      // Remove the leading /api/users from req.url since we're already under @Controller('users')
      const path = req.url.startsWith('/api/users') ? req.url.substring(10) : req.url;
      const url = `${this.userServiceUrl}/api/users${path}`;

      console.log(`[Users Proxy] ${req.method} ${url}`);

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
      console.error('[Users Proxy] Error:', error.message);
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: 'Internal server error' };
      res.status(status).json(data);
    }
  }
}
