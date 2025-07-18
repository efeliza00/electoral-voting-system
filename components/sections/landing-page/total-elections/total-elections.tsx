import { NumberTicker } from '@/components/magicui/number-ticker'
import { Vote } from 'lucide-react'

const TotalElections = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/elections/count`)
  const data:number = await res.json()
  return (
    <div className='bg-muted/50 flex-col flex items-center  justify-center py-26 '>
      <div className='p-4 shadow bg-accent rounded-xl'><Vote  className='text-primary size-28'/></div>
      
      <NumberTicker value={data} className='text-primary font-semibold text-7xl leading-loose'/>
      <h1 className='text-secondary-foreground text-2xl leading-loose'>Total Created Elections</h1>
    </div>
  )
}

export default TotalElections