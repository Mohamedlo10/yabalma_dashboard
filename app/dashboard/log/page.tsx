import Log_table from '@/components/logtable_display'
import Pop from '@/components/pop'
import { Input } from '@/components/ui/input'
import React from 'react'

function page() {
  return (
    <div className='w-full h-full bg-white' >
        <div className='flex justify-end py-2 px-2 shadow-md'>
          
           <div className='flex space-x-3 py-2'>
                <p className='text-white font-medium rounded-md px-2 bg-[#b91c1c] py-2'>Enregistrer </p>
               
           </div>
        </div>
        <div className='flex gap-2 py-4 px-3'>
            <div className='w-1/2 '>
            <Input id="search" type="tel" className="bg-white h-10"  placeholder="search"  required/>
            </div>
            <div className='w-1/2'>
                <Pop />
            </div>
        </div>
        <div>
          <Log_table />
        </div>
    </div>
  )
}

export default page