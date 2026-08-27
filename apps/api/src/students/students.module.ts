import { Module } from "@nestjs/common";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { GeocodingModule } from "../geocoding/geocoding.module";

@Module({
  imports: [PrismaModule, AuthModule, GeocodingModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
