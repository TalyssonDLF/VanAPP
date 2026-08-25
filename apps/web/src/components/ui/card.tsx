import * as React from 'react'; import { cn } from '@/lib/utils'; export function Card({className,...p}:React.ComponentProps<'div'>){return <div className={cn('rounded-lg border border-neutral-200 bg-white',className)} {...p}/>}

export function CardHeader({className,...props}:React.ComponentProps<'div'>){return <div className={cn('p-5 pb-3',className)} {...props}/>}
export function CardTitle({className,...props}:React.ComponentProps<'h2'>){return <h2 className={cn('font-semibold',className)} {...props}/>}
export function CardContent({className,...props}:React.ComponentProps<'div'>){return <div className={cn('p-5 pt-2',className)} {...props}/>}
