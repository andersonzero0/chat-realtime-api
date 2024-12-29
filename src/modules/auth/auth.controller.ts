import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthProjectsGuard } from './auth.projects.guard';
import { ApiDefaultResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Token is sent by email',
  })
  @Get(':id')
  async auth(@Param('id') id: string) {
    try {
      return await this.authService.authProject(id);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Generate token' })
  @ApiDefaultResponse({ description: 'Token generated', type: TokenDto })
  @UseGuards(AuthProjectsGuard)
  @Get('generate-token/:id')
  async generateToken(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.authService.generateTokenFromUser(
        req.project_id + '_' + id,
      );
    } catch (error) {
      throw error;
    }
  }
}
