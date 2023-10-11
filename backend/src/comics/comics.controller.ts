import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { Comic } from './schema';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Get('/latest')
  async getLatest(@Res() response) {
    try {
      const latestComic = await this.comicsService.getLatest();
      return response.status(HttpStatus.OK).json({
        message: 'Comic obtained successfully',
        latestComic,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @Get('/:id')
  async getSpecific(@Res() response, @Param('id') id: string) {
    try {
      const specificComic = await this.comicsService.getById(parseInt(id));
      return response.status(HttpStatus.OK).json({
        message: 'Comic obtained successfully',
        specificComic,
      });
    } catch (err) {
      return response.status(err.status).json(err.rsponse);
    }
  }
}
