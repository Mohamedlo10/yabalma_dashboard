import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import Datepic from './datepic'
  

function Pop() {
  return (
    <div className='flex  w-full shadow-md py-2 px-2 justify-center '>
        <Popover>
            <PopoverTrigger >Select a date</PopoverTrigger>
            <PopoverContent className='w-96'>
                <Datepic />
            </PopoverContent>
        </Popover>
       
    </div>
  )
}

export default Pop