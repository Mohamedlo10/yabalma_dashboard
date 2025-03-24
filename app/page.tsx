import Login from "@/components/ui/login";
import Image from "next/image";

export default function home() {
	return (
		<div className="w-full lg:grid h-screen  bg-zinc-800 lg:grid-cols-2 ">
			<div className="md:flex items-center hidden h-full justify-center ">
				<Login />
			</div>
			<div className="hidden px-8 bg-gray-50 lg:block">
				<Image
					src="/logoYabalma.svg"
					alt="Image"
					width={890}
					height={890}
					className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
			<div className="h-96 md:hidden flex items-center justify-center w-full text-2xl font-extrabold">
				VERSION MOBILE NON DISPONIBLE
			</div>
		</div>
	);
}
