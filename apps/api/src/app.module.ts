import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { GuardiansModule } from './guardians/guardians.module';
import { StudentsModule } from './students/students.module';
import { SchoolsModule } from './schools/schools.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, GuardiansModule, StudentsModule, SchoolsModule] })
export class AppModule {}
