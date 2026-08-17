import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto, SchoolQueryDto, UpdateSchoolDto } from './dto/school.dto';

const schoolFields = { id:true,name:true,phone:true,postalCode:true,street:true,number:true,complement:true,neighborhood:true,city:true,state:true,entryTime:true,exitTime:true,status:true,notes:true,createdAt:true,updatedAt:true } satisfies Prisma.SchoolSelect;

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateSchoolDto) { return this.prisma.school.create({ data: { name:dto.name,phone:dto.phone,postalCode:dto.postalCode,street:dto.street,number:dto.number,complement:dto.complement,neighborhood:dto.neighborhood,city:dto.city,state:dto.state,entryTime:dto.entryTime,exitTime:dto.exitTime,status:dto.status,notes:dto.notes }, select:schoolFields }); }
  async list(query: SchoolQueryDto) {
    const search=query.search?.trim();
    const where:Prisma.SchoolWhereInput={...(query.status&&{status:query.status}),...(search&&{OR:['name','neighborhood','city'].map(field=>({[field]:{contains:search,mode:'insensitive'}}))})};
    const [rows,total]=await this.prisma.$transaction([this.prisma.school.findMany({where,skip:(query.page-1)*query.pageSize,take:query.pageSize,orderBy:{name:'asc'},select:{...schoolFields,_count:{select:{students:true}}}}),this.prisma.school.count({where})]);
    return {data:rows.map(({_count,...school})=>({...school,studentCount:_count.students})),pagination:{page:query.page,pageSize:query.pageSize,total,totalPages:Math.ceil(total/query.pageSize)}};
  }
  async findOne(id:string) { const school=await this.prisma.school.findUnique({where:{id},select:{...schoolFields,students:{select:{id:true,name:true,status:true},orderBy:{name:'asc'}},_count:{select:{students:true}}}});if(!school)throw new NotFoundException('Escola não encontrada.');const {_count,...data}=school;return {...data,studentCount:_count.students}; }
  async update(id:string,dto:UpdateSchoolDto) { await this.findOne(id);return this.prisma.school.update({where:{id},data:{name:dto.name,phone:dto.phone,postalCode:dto.postalCode,street:dto.street,number:dto.number,complement:dto.complement,neighborhood:dto.neighborhood,city:dto.city,state:dto.state,entryTime:dto.entryTime,exitTime:dto.exitTime,status:dto.status,notes:dto.notes},select:schoolFields}); }
  async remove(id:string) { await this.findOne(id);const students=await this.prisma.student.count({where:{schoolId:id}});if(students)throw new ConflictException('Esta escola possui alunos vinculados. Remova ou altere os vínculos antes de excluí-la.');await this.prisma.school.delete({where:{id}});return {message:'Escola excluída.'}; }
}
