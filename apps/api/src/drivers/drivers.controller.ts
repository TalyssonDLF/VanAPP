import { Body,Controller,Delete,Get,Param,Patch,Post,Query,UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateDriverDto,DriverQueryDto,UpdateDriverDto } from './dto/driver.dto';
import { DriversService } from './drivers.service';
@UseGuards(AuthGuard) @Controller('drivers')
export class DriversController { constructor(private readonly service:DriversService){} @Get() list(@Query() q:DriverQueryDto){return this.service.list(q)} @Get(':id') one(@Param('id') id:string){return this.service.findOne(id)} @Post() create(@Body() dto:CreateDriverDto){return this.service.create(dto)} @Patch(':id') update(@Param('id') id:string,@Body() dto:UpdateDriverDto){return this.service.update(id,dto)} @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id)} }
