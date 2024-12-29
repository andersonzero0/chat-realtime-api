import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectDto } from './dto/projects.dto';
import { PrismaService } from '../../services/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(data: ProjectDto) {
    const date: Date = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
    );

    try {
      return await this.prisma.project.create({
        data: {
          ...data,
          created_at: date,
          updated_at: date,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getProjects() {
    try {
      return await this.prisma.project.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getProjectById(id: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: {
          id,
        },
      });

      if (!project) {
        throw new NotFoundException("Project doesn't exist");
      }

      return project;
    } catch (error) {
      throw error;
    }
  }

  async updateProject(id: string, data: ProjectDto) {
    try {
      const project = await this.prisma.project.findUnique({
        where: {
          id,
        },
      });

      if (!project) {
        throw new NotFoundException("Project doesn't exist");
      }

      return await this.prisma.project.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: {
          id,
        },
      });

      if (!project) {
        throw new NotFoundException("Project doesn't exist");
      }

      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
