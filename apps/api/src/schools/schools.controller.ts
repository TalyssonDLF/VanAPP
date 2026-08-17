import { Body,Controller,Delete,Get,Param,Patch,Post,Query,UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSchoolDto,SchoolQueryDto,UpdateSchoolDto } from './dto/school.dto';
import { SchoolsService } from './schools.service';
@UseGuards(AuthGuard) @Controller('schools') export class SchoolsController { constructor(private readonly service:SchoolsService){} @Get() list(@Query() query:SchoolQueryDto){return this.service.list(query)} @Get(':id') one(@Param('id') id:string){return this.service.findOne(id)} @Post() create(@Body() dto:CreateSchoolDto){return this.service.create(dto)} @Patch(':id') update(@Param('id') id:string,@Body() dto:UpdateSchoolDto){return this.service.update(id,dto)} @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id)} }
