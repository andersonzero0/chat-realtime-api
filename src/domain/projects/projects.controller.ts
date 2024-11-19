/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  //Get,
  //Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthProjectsGuard } from '../auth/auth.projects.guard';
import {
  ApiDefaultResponse,
  ApiExcludeController,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectDto } from './dto/projects.dto';

@ApiTags('Projects')
@ApiExcludeController()
@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectsService) {}

  @ApiOperation({
    summary: 'Create a new project',
  })
  @ApiDefaultResponse({
    type: ProjectDto,
  })
  @Post()
  async create(@Body() createProjectDto: ProjectDto) {
    try {
      return await this.projectService.createProject(createProjectDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getProjects() {
    try {
      return await this.projectService.getProjects();
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthProjectsGuard)
  @Put()
  async updateProject(
    @Body() createProjectDto: ProjectDto,
    @Request() req: any,
  ) {
    try {
      return await this.projectService.updateProject(
        req.project_id,
        createProjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthProjectsGuard)
  @Delete()
  async deleteProject(@Request() req: any) {
    try {
      return await this.projectService.deleteProject(req.project_id);
    } catch (error) {
      throw error;
    }
  }
}
