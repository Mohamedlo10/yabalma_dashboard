
function page() {
  return (
    <div className="flex flex-col h-[92vh] overflow-y-auto w-full">

<div className="max-h-64 min-h-20 w-full flex justify-center gap-96 items-center content-center p-1">
  <div className="flex flex-col justify-center items-center content-center">
    <p className="text-3xl text-red-600 font-bold">25692</p>
    <p className="text-black font-bold">Utilisateurs</p>
  </div>
  <div className="flex flex-col justify-center items-center content-center">
    <p className="text-5xl text-red-600 font-bold">23602</p>
    <p className="text-black font-bold">Actifs</p>
  </div>
  <div className="flex flex-col justify-center items-center content-center">
    <p className="text-3xl text-zinc-500 font-bold">2090</p>
    <p className="text-black font-bold">Abandons</p>
  </div>
</div>

<div className="grid grid-cols-1 h-full w-full">
      <div className="grid grid-cols-10 h-full w-full bg-gray-500">
        <div className="col-span-6  bg-orange-800"></div>
        <div className="col-span-4  bg-orange-200"></div>
      </div>

      <div className="grid grid-cols-10 h-full w-full bg-black"> 
        <div className="col-span-6 bg-orange-600"></div>
        <div className="col-span-4 bg-orange-300"></div>
      </div>
</div>
     


    </div>
  )
}

export default page