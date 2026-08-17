import { api } from './client';
import { query,type Page,type StudentStatus } from './resources';
export type SchoolStatus='ACTIVE'|'INACTIVE';
export interface School {id:string;name:string;phone?:string;postalCode?:string;street?:string;number?:string;complement?:string;neighborhood?:string;city?:string;state?:string;entryTime?:string;exitTime?:string;status:SchoolStatus;notes?:string;createdAt:string;updatedAt:string}
export interface SchoolListItem extends School {studentCount:number}
export interface SchoolDetail extends SchoolListItem {students:Array<{id:string;name:string;status:StudentStatus}>}
export interface CreateSchoolInput {name:string;phone?:string;postalCode?:string;street?:string;number?:string;complement?:string;neighborhood?:string;city?:string;state?:string;entryTime?:string;exitTime?:string;status:SchoolStatus;notes?:string}
export type UpdateSchoolInput={name?:string;status?:SchoolStatus;phone?:string|null;postalCode?:string|null;street?:string|null;number?:string|null;complement?:string|null;neighborhood?:string|null;city?:string|null;state?:string|null;entryTime?:string|null;exitTime?:string|null;notes?:string|null};
export const schoolsApi={list:(params:Record<string,string|number|undefined>)=>api<Page<SchoolListItem>>(`/schools?${query(params)}`),one:(id:string)=>api<SchoolDetail>(`/schools/${id}`),create:(data:CreateSchoolInput)=>api<School>('/schools',{method:'POST',body:JSON.stringify(data)}),update:(id:string,data:UpdateSchoolInput)=>api<School>(`/schools/${id}`,{method:'PATCH',body:JSON.stringify(data)}),remove:(id:string)=>api<{message:string}>(`/schools/${id}`,{method:'DELETE'})};
