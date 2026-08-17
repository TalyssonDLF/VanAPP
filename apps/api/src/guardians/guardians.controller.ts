import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateGuardianDto, GuardianQueryDto, UpdateGuardianDto } from './dto/guardian.dto';
import { GuardiansService } from './guardians.service';
@UseGuards(AuthGuard) @Controller('guardians')
export class GuardiansController {
  constructor(private readonly service: GuardiansService) {}
  @Get() list(@Query() query: GuardianQueryDto) { return this.service.list(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateGuardianDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateGuardianDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
