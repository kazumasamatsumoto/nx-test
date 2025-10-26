import { Controller, All, Get, Post, Put, Delete, Patch, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('products')
export class ProductsProxyController {
  private readonly productServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://localhost:3002';
  }

  @All('*path')
  @All()
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Products Proxy DEBUG] req.url: ${req.url}, req.path: ${req.path}, req.originalUrl: ${req.originalUrl}`);

      // Remove the leading /api/products from req.url since we're already under @Controller('products')
      const path = req.url.startsWith('/api/products') ? req.url.substring(13) : req.url;
      const url = `${this.productServiceUrl}/api/products${path}`;

      console.log(`[Products Proxy] ${req.method} ${url}`);

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
      console.error('[Products Proxy] Error:', error.message);
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: 'Internal server error' };
      res.status(status).json(data);
    }
  }
}
