'use client'
import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from './ui/calendar';

function Datepic() {
    const [selectedTime, setSelectedTime] = useState("12:00");

      // Fonction pour générer des heures avec 30 min d'écart
  const timeOptions = Array.from({ length: 24 }).flatMap((_, hour) => [
    `${hour.toString().padStart(2, "0")}:00`,
    `${hour.toString().padStart(2, "0")}:30`,
  ]);
  return (
    <div>
        <Tabs defaultValue="absolute">
          <TabsList>
            <TabsTrigger value="absolute">Absolute</TabsTrigger>
            <TabsTrigger value="relative">Relative</TabsTrigger>
            <TabsTrigger value="now">Now</TabsTrigger>
          </TabsList>

          {/* Onglet Absolute */}
          <TabsContent value="absolute">
            <div className="flex">
              <Calendar />
              <div className="ml-4">
                <p>Heures / Minutes</p>
                <div
                  className="h-48 w-24 overflow-y-auto border border-gray-200 rounded"
                  style={{ maxHeight: "200px" }} // Limite la hauteur avec un scrollable
                >
                  {timeOptions.map((time) => (
                    <div
                      key={time}
                      className={`p-2 cursor-pointer ${
                        selectedTime === time ? "bg-blue-500 text-white" : ""
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Relative */}
          <TabsContent value="relative">
            <div className="flex space-x-4">
              <input
                type="number"
                className="input"
                placeholder="Enter value"
              />
              <select className="select">
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
                <option value="seconds">Seconds</option>
              </select>
            </div>
          </TabsContent>

          {/* Onglet Now */}
          <TabsContent value="now">
            <button
              className="btn"
              onClick={() => alert(`Date set to: ${new Date().toISOString()}`)}
            >
              Set to Now
            </button>
          </TabsContent>
        </Tabs>
    </div>
  )
}

export default Datepic