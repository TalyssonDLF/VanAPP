import { ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SchoolStatus } from '@prisma/client';
import { CreateSchoolDto, SchoolQueryDto } from '../src/schools/dto/school.dto';
import { SchoolsService } from '../src/schools/schools.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('School DTOs',()=>{
  it('normaliza e aceita uma escola válida',async()=>{const dto=plainToInstance(CreateSchoolDto,{name:' Colégio Teste ',phone:'(41) 3333-3333',postalCode:'80000-000',state:'pr',entryTime:'07:30',exitTime:'12:00',status:'ACTIVE'});expect(await validate(dto)).toHaveLength(0);expect(dto).toMatchObject({name:'Colégio Teste',phone:'4133333333',postalCode:'80000000',state:'PR'});});
  it.each([{name:' '},{name:'Escola',phone:'123'},{name:'Escola',postalCode:'123'},{name:'Escola',state:'XX'},{name:'Escola',entryTime:'25:70'},{name:'Escola',exitTime:'7h30'},{name:'Escola',status:'UNKNOWN'}])('rejeita campo inválido: %o',async value=>expect((await validate(plainToInstance(CreateSchoolDto,value))).length).toBeGreaterThan(0));
  it('valida paginação e filtro',async()=>expect(await validate(plainToInstance(SchoolQueryDto,{page:'1',pageSize:'20',status:'ACTIVE'}))).toHaveLength(0));
  it('rejeita pageSize excessivo',async()=>expect((await validate(plainToInstance(SchoolQueryDto,{pageSize:'101'}))).length).toBeGreaterThan(0));
});

describe('SchoolsService',()=>{
  const school={id:'school-1',name:'Colégio Teste',phone:null,postalCode:null,street:null,number:null,complement:null,neighborhood:null,city:'Curitiba',state:'PR',entryTime:null,exitTime:null,status:SchoolStatus.ACTIVE,notes:null,createdAt:new Date(),updatedAt:new Date()};
  const db={school:{create:jest.fn(),findMany:jest.fn(),count:jest.fn(),findUnique:jest.fn(),update:jest.fn(),delete:jest.fn()},student:{count:jest.fn()},$transaction:jest.fn()};
  const service=new SchoolsService(db as unknown as PrismaService);
  beforeEach(()=>jest.clearAllMocks());
  it('cria escola com campos permitidos',async()=>{db.school.create.mockResolvedValue(school);await expect(service.create(plainToInstance(CreateSchoolDto,{name:'Colégio Teste'}))).resolves.toBe(school);});
  it.each([['nome','positivo'],['cidade','Curitiba']])('lista com busca por %s',async(_,search)=>{db.$transaction.mockResolvedValue([[{...school,_count:{students:2}}],1]);const result=await service.list(Object.assign(new SchoolQueryDto(),{search,page:1,pageSize:20}));expect(result.data[0].studentCount).toBe(2);expect(db.$transaction).toHaveBeenCalled();});
  it('filtra por status',async()=>{db.$transaction.mockResolvedValue([[],0]);await service.list(Object.assign(new SchoolQueryDto(),{status:SchoolStatus.INACTIVE,page:1,pageSize:20}));});
  it('retorna detalhes e alunos',async()=>{db.school.findUnique.mockResolvedValue({...school,students:[],_count:{students:0}});await expect(service.findOne(school.id)).resolves.toMatchObject({id:school.id,studentCount:0,students:[]});});
  it('retorna 404',async()=>{db.school.findUnique.mockResolvedValue(null);await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);});
  it('atualiza escola',async()=>{db.school.findUnique.mockResolvedValue({...school,students:[],_count:{students:0}});db.school.update.mockResolvedValue({...school,status:SchoolStatus.INACTIVE});await expect(service.update(school.id,{status:SchoolStatus.INACTIVE})).resolves.toMatchObject({status:SchoolStatus.INACTIVE});});
  it('exclui escola sem alunos',async()=>{db.school.findUnique.mockResolvedValue({...school,students:[],_count:{students:0}});db.student.count.mockResolvedValue(0);await expect(service.remove(school.id)).resolves.toEqual({message:'Escola excluída.'});expect(db.school.delete).toHaveBeenCalled();});
  it('impede exclusão com alunos',async()=>{db.school.findUnique.mockResolvedValue({...school,students:[],_count:{students:1}});db.student.count.mockResolvedValue(1);await expect(service.remove(school.id)).rejects.toBeInstanceOf(ConflictException);expect(db.school.delete).not.toHaveBeenCalled();});
});
