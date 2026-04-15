import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, passwordHash });
    return this.usersRepository.save(user);
  }

async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await this.findOneById(userId);
  if (!user) throw new NotFoundException('User not found');
  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) throw new BadRequestException('Old password is incorrect');
  const newHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = newHash;
  await this.usersRepository.save(user);
}
}