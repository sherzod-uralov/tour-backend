import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Difficulty } from './entities/difficulty.entity';
import { CreateDifficultyDto } from './dto/create-difficulty.dto';
import { UpdateDifficultyDto } from './dto/update-difficulty.dto';

@Injectable()
export class DifficultiesService {
  constructor(
    @InjectRepository(Difficulty)
    private difficultiesRepository: Repository<Difficulty>,
  ) {}

  async create(createDifficultyDto: CreateDifficultyDto): Promise<Difficulty> {
    const difficulty = this.difficultiesRepository.create(createDifficultyDto);
    return this.difficultiesRepository.save(difficulty);
  }

  async findAll(): Promise<Difficulty[]> {
    return this.difficultiesRepository.find();
  }

  async findOne(id: number): Promise<Difficulty> {
    const difficulty = await this.difficultiesRepository.findOne({ where: { id } });
    if (!difficulty) {
      throw new NotFoundException(`Difficulty with ID ${id} not found`);
    }
    return difficulty;
  }

  async update(id: number, updateDifficultyDto: UpdateDifficultyDto): Promise<Difficulty> {
    const difficulty = await this.findOne(id);
    
    // Update difficulty properties
    Object.assign(difficulty, updateDifficultyDto);
    
    return this.difficultiesRepository.save(difficulty);
  }

  async remove(id: number): Promise<void> {
    const difficulty = await this.findOne(id);
    await this.difficultiesRepository.remove(difficulty);
  }
}