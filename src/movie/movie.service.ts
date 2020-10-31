import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { MovieRepository } from './movie.repository';
import { FilesService } from '../files/files.service';
import { Movie } from './movie.entity';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { ActorsService } from '../actors/actors.service';
import { DirectorsService } from '../directors/directors.service';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly filesService: FilesService,
    private readonly actorsService: ActorsService,
    private readonly directorsService: DirectorsService,
  ) {}

  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.find();
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const { attributes, relationships } = createMovieDto;
    const actors = await this.actorsService.getActorsByIds(relationships.actors);
    const directors = await this.directorsService.getDirectorsByIds(
      relationships.directors,
    );
    return await this.movieRepository.createNewMovie(attributes, actors, directors);
  }

  async update(
    id: string,
    data: Partial<UpdateMovieDto>,
  ): Promise<UpdateResult> {
    return await this.movieRepository.update(id, data);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.movieRepository.delete(id);
  }

  async uploadFiles(
    movieId: number,
    preview: Express.Multer.File,
    videoFile: Express.Multer.File,
  ) {
    const previewModel = await this.filesService.uploadPreview(preview);
    const videoFileModel = await this.filesService.uploadVideo(videoFile);

    await this.movieRepository.updateFiles(
      movieId,
      previewModel,
      videoFileModel,
    );

    return {
      preview: previewModel,
      videoFile: videoFileModel,
    };
  }
}
