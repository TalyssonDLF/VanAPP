import { BadRequestException } from '@nestjs/common';
import { SchoolStatus,StudentStatus } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { StudentsService } from '../src/students/students.service';

describe('StudentsService + School',()=>{
  const school={id:'school-1',name:'Colégio Teste',status:SchoolStatus.ACTIVE,city:'Curitiba',state:'PR'};
  const student={id:'student-1',name:'João Silva',birthDate:null,document:null,status:StudentStatus.ACTIVE,notes:null,createdAt:new Date(),updatedAt:new Date(),schoolId:school.id,school};
  const db={school:{findUnique:jest.fn()},guardian:{count:jest.fn()},student:{create:jest.fn(),findUnique:jest.fn(),update:jest.fn(),delete:jest.fn()},studentGuardian:{deleteMany:jest.fn(),createMany:jest.fn()},$transaction:jest.fn()};
  const service=new StudentsService(db as unknown as PrismaService);
  beforeEach(()=>{jest.clearAllMocks();db.$transaction.mockImplementation((callback:unknown)=>Promise.resolve(typeof callback==='function'?(callback as (tx:typeof db)=>unknown)(db):callback))});
  it('cria aluno com escola ativa',async()=>{db.school.findUnique.mockResolvedValue(school);db.student.create.mockResolvedValue(student);await expect(service.create({name:'João Silva',status:StudentStatus.ACTIVE,guardians:[],schoolId:school.id})).resolves.toMatchObject({school});});
  it('cria aluno sem escola',async()=>{db.student.create.mockResolvedValue({...student,schoolId:null,school:null});await service.create({name:'João Silva',status:StudentStatus.ACTIVE,guardians:[]});expect(db.school.findUnique).not.toHaveBeenCalled();});
  it.each([null,{...school,status:SchoolStatus.INACTIVE}])('rejeita escola inválida',async(found)=>{db.school.findUnique.mockResolvedValue(found);await expect(service.create({name:'João Silva',status:StudentStatus.ACTIVE,guardians:[],schoolId:school.id})).rejects.toBeInstanceOf(BadRequestException);});
  it('troca escola',async()=>{db.student.findUnique.mockResolvedValue({...student,guardians:[]});db.school.findUnique.mockResolvedValue(school);db.student.update.mockResolvedValue(student);await service.update(student.id,{schoolId:school.id});});
  it('remove escola',async()=>{db.student.findUnique.mockResolvedValue({...student,guardians:[]});db.student.update.mockResolvedValue({...student,schoolId:null,school:null});await service.update(student.id,{schoolId:null});});
  it('retorna escola no aluno',async()=>{db.student.findUnique.mockResolvedValue({...student,guardians:[]});await expect(service.findOne(student.id)).resolves.toMatchObject({school});});
  it('excluir aluno não exclui escola',async()=>{db.student.findUnique.mockResolvedValue({...student,guardians:[]});await service.remove(student.id);expect(db.student.delete).toHaveBeenCalled();expect(db.school).not.toHaveProperty('delete');});
});
