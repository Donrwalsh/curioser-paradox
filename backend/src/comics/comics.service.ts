import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IComic } from 'src/comics/schema';

const PUBLISHED_FILTER = {
  state: { $eq: 'published' },
};

@Injectable()
export class ComicsService {
  constructor(@InjectModel('Comic') private comicModel: Model<IComic>) {}

  async getAllPublishedComics() {
    return this.getAllComics(true);
  }

  async getAllComics(onlyPub: boolean = false): Promise<IComic[]> {
    const allComics = await this.comicModel.find(
      onlyPub ? PUBLISHED_FILTER : {},
    );
    return allComics;
  }

  async getPublishedIndexes() {
    return this.getIndexes(true);
  }

  async getIndexes(onlyPub: boolean = false): Promise<number[]> {
    const indexes = await this.comicModel
      .find(onlyPub ? PUBLISHED_FILTER : {})
      .distinct('index');
    return indexes;
  }

  async getPublishedSeriesNames() {
    return this.getSeriesNames(true);
  }

  async getSeriesNames(onlyPub: boolean = false): Promise<string[]> {
    const seriesNames = await this.comicModel
      .find(onlyPub ? PUBLISHED_FILTER : {})
      .distinct('series');
    return seriesNames;
  }

  async getLatest(): Promise<IComic> {
    const latestComics = await this.comicModel
      .find({ state: { $eq: 'published' } })
      .sort({ index: -1 })
      .lean();

    if (!latestComics || latestComics.length == 0) {
      throw new NotFoundException('Latest comic not found!');
    }
    return {
      ...latestComics[0],
      prevIndex: latestComics[1].index,
      nextIndex: null,
    };
  }

  async getById(id: number): Promise<IComic> {
    const comic = await this.comicModel
      .findOne({ index: { $eq: id }, state: { $eq: 'published' } })
      // .select({ image: 0 })
      .lean();

    if (!comic) {
      throw new NotFoundException('Comic not found!');
    }

    const prevComic = await this.comicModel
      .findOne({ index: { $lt: id }, state: { $eq: 'published' } })
      .sort({ index: -1 })
      .lean();

    const nextComic = await this.comicModel
      .findOne({ index: { $gt: id }, state: { $eq: 'published' } })
      .lean();

    return {
      ...comic,
      prevIndex: prevComic ? prevComic.index : null,
      nextIndex: nextComic ? nextComic.index : null,
    };
  }
}
