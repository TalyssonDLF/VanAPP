import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateDriverDto, DriverQueryDto } from '../src/drivers/dto/driver.dto';
import { licenseStatus } from '../src/drivers/driver.constants';

const valid = { name:' Carlos da Silva ',document:'529.982.247-25',phone:'(41) 99999-9999',email:'CARLOS@EXAMPLE.COM',licenseNumber:'01234567890',licenseCategory:'D',licenseExpiresAt:'2030-01-01',status:'ACTIVE' };
describe('driver DTOs',()=>{
  it('accepts and normalizes valid data',async()=>{const dto=plainToInstance(CreateDriverDto,valid);expect(await validate(dto)).toHaveLength(0);expect(dto.document).toBe('52998224725');expect(dto.phone).toBe('41999999999');expect(dto.name).toBe('Carlos da Silva');expect(dto.email).toBe('carlos@example.com')});
  it.each([{name:' '},{document:'111.111.111-11'},{phone:'123'},{email:'invalid'},{licenseNumber:''},{licenseCategory:'Z'},{licenseExpiresAt:'not-a-date'},{status:'BLOCKED'}])('rejects invalid input %o',async(change)=>expect((await validate(plainToInstance(CreateDriverDto,{...valid,...change}))).length).toBeGreaterThan(0));
  it('validates pagination limits',async()=>expect((await validate(plainToInstance(DriverQueryDto,{page:1,pageSize:101}))).length).toBeGreaterThan(0));
});
describe('license status',()=>{const now=new Date('2026-08-17T12:00:00Z');it('returns valid',()=>expect(licenseStatus(new Date('2026-10-01'),now)).toBe('VALID'));it('returns expiring soon',()=>expect(licenseStatus(new Date('2026-09-01'),now)).toBe('EXPIRING_SOON'));it('returns expired',()=>expect(licenseStatus(new Date('2026-08-16'),now)).toBe('EXPIRED'))});
