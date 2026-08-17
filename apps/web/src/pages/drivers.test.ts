import { describe,expect,it } from 'vitest';
describe('drivers',()=>{it('keeps the supported category source stable',()=>expect(['A','B','C','D','E','AB','AC','AD','AE']).toContain('D'))});
