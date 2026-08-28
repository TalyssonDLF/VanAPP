import { Module } from "@nestjs/common";
import { GeocodingModule } from "../geocoding/geocoding.module";
import { SchoolsController } from "./schools.controller";
import { SchoolsService } from "./schools.service";
@Module({
  imports: [GeocodingModule],
  controllers: [SchoolsController],
  providers: [SchoolsService],
})
export class SchoolsModule {}
