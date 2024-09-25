"use client"


import { BarChartComponent } from "@/components/ui/home/bar-chart"
import Commande from "@/components/ui/home/commande"
import Commentaire from "@/components/ui/home/commentaire"
import { RadialChartComponent } from "@/components/ui/home/radial-chart"
import TopGC from "@/components/ui/home/topGC"
import CirculaireComponent from "@/components/ui/home/utilisateurs-chart"


export const description = "A collection of health charts."

export function Accueil() {
  return (
    <div className="chart-wrapper max-h-[90vh]  overflow-y-auto mx-auto flex max-w-8xl flex-col flex-wrap items-start justify-center gap-2 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full mx-auto gap-2 sm:grid-cols-1 lg:grid-cols-1 ">
        <div className="w-full grid grid-cols-2 gap-2">
          <div className=" grid grid-cols-1 gap-2">
          <BarChartComponent/>
          <div className=" grid grid-cols-2 gap-2">
            <TopGC/>
            <RadialChartComponent/>
          </div>
          </div>
          <div className=" grid grid-cols-1 gap-2">
            <div className=" grid grid-cols-2 gap-2 ">
                <div className="">
                <CirculaireComponent/>
                </div>
                <div className="">
                <Commentaire/>
                </div>

                
            </div>
              <Commande/>
          </div>
        </div>
      </div>
          
    </div>
  )
}
export default Accueil
