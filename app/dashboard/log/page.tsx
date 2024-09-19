import Pop from '@/components/pop'
import { Input } from '@/components/ui/input'
import React from 'react'

function page() {
  return (
    <div className='w-full h-full bg-white' >
        <div className='flex justify-between py-2 px-2 shadow-md'>
            <p className='text-base'>yabalma log</p>
           <div className='flex space-x-3'>
                <p className='text-black font-medium'>Enregistrer</p>
                <p>Exporter</p>
           </div>
        </div>
        <div className='flex gap-2'>
            <div>
            <Input id="search" type="email" className="bg-white"  placeholder="user number"  required/>
            </div>
            <div>
                <Pop />
            </div>
        </div>

    </div>
  )
}

export default page