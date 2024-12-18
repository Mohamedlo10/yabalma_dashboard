"use client";
import { Suspense } from "react";
import RecupInfo from "./recupInfo";





export default function Page() {
  return(
      <Suspense fallback={<div>Chargement...</div>}>
        <RecupInfo />
      </Suspense>
  )

}



