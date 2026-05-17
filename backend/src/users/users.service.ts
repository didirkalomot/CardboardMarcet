import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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
    // Проверяем, есть ли вообще пользователи в базе
    const count = await this.usersRepository.count();
    // Если это первый пользователь - даем роль ADMIN, иначе COLLECTOR
    const role = count === 0 ? UserRole.ADMIN : UserRole.COLLECTOR;

    const user = this.usersRepository.create({
      email,
      passwordHash,
      role,
    });
    return this.usersRepository.save(user);
  }
}
