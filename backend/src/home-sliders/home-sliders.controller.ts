import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HomeSlidersService } from './home-sliders.service';
import { CreateHomeSliderDto, UpdateHomeSliderDto } from './dto/home-slider.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Home Sliders')
@Controller('home-sliders')
export class HomeSlidersController {
  constructor(private readonly slidersService: HomeSlidersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sliders (mobile)' })
  findAll() {
    return this.slidersService.findAll();
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        linkUrl: { type: 'string' },
        sortOrder: { type: 'number' },
      },
    },
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.slidersService.create({
      imageUrl: `/uploads/${file.filename}`,
      title: body.title,
      subtitle: body.subtitle,
      linkUrl: body.linkUrl,
      sortOrder: body.sortOrder ? Number(body.sortOrder) : 0,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.slidersService.delete(id);
  }
}
