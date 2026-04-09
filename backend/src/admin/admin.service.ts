import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'role', 'isVerified', 'rating'],
    });
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = newRole;
    await this.userRepository.save(user);
    return { message: 'Role updated successfully', user };
  }
}