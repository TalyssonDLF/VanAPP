import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LICENSE_EXPIRING_SOON_DAYS, licenseStatus } from './driver.constants';
import { CreateDriverDto, DriverQueryDto, UpdateDriverDto } from './dto/driver.dto';

const select = { id:true,name:true,document:true,phone:true,email:true,birthDate:true,licenseNumber:true,licenseCategory:true,licenseExpiresAt:true,status:true,notes:true,createdAt:true,updatedAt:true } satisfies Prisma.DriverSelect;
@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}
  private result<T extends { licenseExpiresAt: Date }>(driver: T) { return { ...driver, licenseStatus: licenseStatus(driver.licenseExpiresAt) }; }
  private conflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const rawTarget: unknown = error.meta?.target; const target = Array.isArray(rawTarget) ? String(rawTarget[0] ?? '') : typeof rawTarget === 'string' ? rawTarget : '';
      throw new ConflictException(target.includes('licenseNumber') ? 'Já existe um motorista cadastrado com esta CNH.' : 'Já existe um motorista cadastrado com este CPF.');
    }
    throw error;
  }
  async create(dto: CreateDriverDto) { try { const item=await this.prisma.driver.create({data:{name:dto.name,document:dto.document,phone:dto.phone,email:dto.email,birthDate:dto.birthDate?new Date(dto.birthDate):null,licenseNumber:dto.licenseNumber.toUpperCase(),licenseCategory:dto.licenseCategory,licenseExpiresAt:new Date(dto.licenseExpiresAt),status:dto.status,notes:dto.notes},select});return this.result(item);} catch(e){return this.conflict(e);} }
  async list(query: DriverQueryDto, reference = new Date()) {
    const search=query.search?.trim(); const digitsOnly=search?.replace(/\D/g,'');
    const today=new Date(Date.UTC(reference.getUTCFullYear(),reference.getUTCMonth(),reference.getUTCDate())); const soon=new Date(today);soon.setUTCDate(soon.getUTCDate()+LICENSE_EXPIRING_SOON_DAYS);
    const licenseWhere:Prisma.DriverWhereInput=query.licenseStatus==='EXPIRED'?{licenseExpiresAt:{lt:today}}:query.licenseStatus==='EXPIRING_SOON'?{licenseExpiresAt:{gte:today,lte:soon}}:query.licenseStatus==='VALID'?{licenseExpiresAt:{gt:soon}}:{};
    const where:Prisma.DriverWhereInput={...licenseWhere,...(query.status&&{status:query.status}),...(query.licenseCategory&&{licenseCategory:query.licenseCategory}),...(search&&{OR:[{name:{contains:search,mode:'insensitive'}},{licenseNumber:{contains:search,mode:'insensitive'}},...(digitsOnly?[{document:{contains:digitsOnly}},{phone:{contains:digitsOnly}}]:[])]})};
    const [data,total]=await this.prisma.$transaction([this.prisma.driver.findMany({where,skip:(query.page-1)*query.pageSize,take:query.pageSize,orderBy:{name:'asc'},select}),this.prisma.driver.count({where})]);
    return {data:data.map(item=>this.result(item)),pagination:{page:query.page,pageSize:query.pageSize,total,totalPages:Math.ceil(total/query.pageSize)}};
  }
  async findOne(id:string){const item=await this.prisma.driver.findUnique({where:{id},select});if(!item)throw new NotFoundException('Motorista não encontrado.');return this.result(item);}
  async update(id:string,dto:UpdateDriverDto){await this.findOne(id);try{const item=await this.prisma.driver.update({where:{id},data:{name:dto.name,document:dto.document,phone:dto.phone,email:Object.prototype.hasOwnProperty.call(dto,'email')?dto.email??null:undefined,birthDate:Object.prototype.hasOwnProperty.call(dto,'birthDate')?(dto.birthDate?new Date(dto.birthDate):null):undefined,licenseNumber:dto.licenseNumber?.toUpperCase(),licenseCategory:dto.licenseCategory,licenseExpiresAt:dto.licenseExpiresAt?new Date(dto.licenseExpiresAt):undefined,status:dto.status,notes:Object.prototype.hasOwnProperty.call(dto,'notes')?dto.notes??null:undefined},select});return this.result(item);}catch(e){return this.conflict(e)}}
  async remove(id:string){await this.findOne(id);await this.prisma.driver.delete({where:{id}});return {message:'Motorista excluído.'};}
}
