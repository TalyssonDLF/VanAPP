import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGuardianDto, GuardianQueryDto } from '../src/guardians/dto/guardian.dto';
import { CreateStudentDto, StudentQueryDto } from '../src/students/dto/student.dto';

describe('DTOs de responsáveis', () => {
  it('normaliza telefone, e-mail e CPF', async () => {
    const dto = plainToInstance(CreateGuardianDto, { name: 'Maria da Silva', phone: '(41) 99999-9999', email: ' MARIA@EXAMPLE.COM ', document: '529.982.247-25' });
    expect(await validate(dto)).toHaveLength(0); expect(dto.phone).toBe('41999999999'); expect(dto.email).toBe('maria@example.com'); expect(dto.document).toBe('52998224725');
  });
  it.each([{ name: '', phone: '41999999999' }, { name: 'Maria', phone: '123' }, { name: 'Maria', phone: '41999999999', email: 'inválido' }, { name: 'Maria', phone: '41999999999', document: '111.111.111-11' }])('rejeita dados inválidos', async (value) => expect((await validate(plainToInstance(CreateGuardianDto, value))).length).toBeGreaterThan(0));
  it.each([{ page: '0' }, { pageSize: '0' }, { pageSize: '101' }])('limita paginação: %o', async (value) => expect((await validate(plainToInstance(GuardianQueryDto, value))).length).toBeGreaterThan(0));
});
describe('DTOs de alunos', () => {
  it('aceita múltiplos responsáveis e vínculos', async () => { const dto=plainToInstance(CreateStudentDto,{name:'João da Silva',status:'ACTIVE',guardians:[{guardianId:'a',relationship:'MOTHER'},{guardianId:'b',relationship:'FATHER'}]});expect(await validate(dto)).toHaveLength(0); });
  it('rejeita IDs duplicados', async () => { const dto=plainToInstance(CreateStudentDto,{name:'João',guardians:[{guardianId:'a',relationship:'MOTHER'},{guardianId:'a',relationship:'FATHER'}]});expect((await validate(dto)).length).toBeGreaterThan(0); });
  it('rejeita status inválido', async () => expect((await validate(plainToInstance(CreateStudentDto,{name:'João',status:'UNKNOWN'}))).length).toBeGreaterThan(0));
  it('rejeita filtro inválido', async () => expect((await validate(plainToInstance(StudentQueryDto,{status:'UNKNOWN'}))).length).toBeGreaterThan(0));
});
