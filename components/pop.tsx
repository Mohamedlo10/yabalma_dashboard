import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import Datepic from './datepic'
  

function Pop() {
  return (
    <div className='flex'>
        <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent className='w-96'>
                <Datepic />
            </PopoverContent>
        </Popover>
        <Popover>
            <PopoverTrigger>autre open</PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
        </Popover>
    </div>
  )
}

export default Pop