import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
export const DropdownMenu=DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger=DropdownMenuPrimitive.Trigger;
export function DropdownMenuContent({className,...props}:React.ComponentProps<typeof DropdownMenuPrimitive.Content>){return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content className={cn('z-50 min-w-36 rounded-md border bg-white p-1 text-sm shadow-md',className)} {...props}/></DropdownMenuPrimitive.Portal>}
export function DropdownMenuItem({className,...props}:React.ComponentProps<typeof DropdownMenuPrimitive.Item>){return <DropdownMenuPrimitive.Item className={cn('cursor-pointer rounded px-3 py-2 outline-none focus:bg-neutral-100',className)} {...props}/>}
