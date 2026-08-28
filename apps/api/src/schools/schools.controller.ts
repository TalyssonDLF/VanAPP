import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SchoolDto, SchoolQueryDto, UpdateSchoolDto } from "./dto/school.dto";
import { SchoolsService } from "./schools.service";
@Controller("schools")
export class SchoolsController {
  constructor(private service: SchoolsService) {}
  @Get() list(@Query() q: SchoolQueryDto) {
    return this.service.list(q);
  }
  @Get(":id") one(@Param("id") id: string) {
    return this.service.one(id);
  }
  @Post() create(@Body() d: SchoolDto) {
    return this.service.create(d);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() d: UpdateSchoolDto) {
    return this.service.update(id, d);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
