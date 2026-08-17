import { afterEach,describe,expect,it,vi } from 'vitest';
import { schoolsApi } from './schools';

afterEach(()=>vi.unstubAllGlobals());
describe('schoolsApi',()=>{
  it('monta a listagem paginada com filtros',async()=>{const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({data:[],pagination:{page:1,pageSize:20,total:0,totalPages:0}}),{status:200,headers:{'Content-Type':'application/json'}}));vi.stubGlobal('fetch',fetchMock);await schoolsApi.list({search:'Curitiba',status:'ACTIVE',page:1,pageSize:20});expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/schools?search=Curitiba&status=ACTIVE&page=1&pageSize=20',expect.objectContaining({credentials:'include'}));});
  it('preserva conflito amigável da API',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({message:'Esta escola possui alunos vinculados.'}),{status:409,headers:{'Content-Type':'application/json'}})));await expect(schoolsApi.remove('school-1')).rejects.toEqual(expect.objectContaining({status:409,message:'Esta escola possui alunos vinculados.'}));});
});
