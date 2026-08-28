import { Module } from "@nestjs/common";
import { GeocodingModule } from "../geocoding/geocoding.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { VehiclesController } from "./vehicles.controller";
import { VehiclesService } from "./vehicles.service";
@Module({
  imports: [PrismaModule, AuthModule, GeocodingModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
