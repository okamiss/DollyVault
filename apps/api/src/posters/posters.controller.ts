import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PostersService } from './posters.service';

@UseGuards(JwtAuthGuard)
@Controller('posters')
export class PostersController {
  constructor(private readonly postersService: PostersService) {}

  @Get('templates')
  templates() {
    return this.postersService.templates();
  }
}
