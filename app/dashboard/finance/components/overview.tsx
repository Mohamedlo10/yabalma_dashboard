"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 67000,
  },
  {
    name: "Feb",
    total: 89000,
  },
  {
    name: "Mar",
    total: 88000,
  },
  {
    name: "Apr",
    total: 63000,
  },
  {
    name: "May",
    total: 40000,
  },
  {
    name: "Jun",
    total: 74000,
  },
  {
    name: "Jul",
    total: 87000,
  },
  {
    name: "Aug",
    total: 72000,
  },
  {
    name: "Sep",
    total: 90000,
  },
  {
    name: "Oct",
    total: 100569,
  },
  {
    name: "Nov",
    total:134400,
  },
  {
    name: "Dec",
    total:167780,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
        />
        
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-[#dc2626]"
        /> 
      </BarChart>
    </ResponsiveContainer>
  )
}
