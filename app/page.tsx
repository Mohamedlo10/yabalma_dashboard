import Image from "next/image";
import Login from "@/components/ui/login";
export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-zinc-800">
      <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid md:max-w-none md:grid-cols-2 md:px-0">
        {/* Left side with illustration and branding */}
        <div className="relative hidden h-full flex-col bg-muted p-10 dark:border-r md:flex">
          <div className="absolute inset-0 bg-zinc-900">
            <Image
              src="/logoYabalma.svg"
              alt="Background"
              fill
              className="object-cover opacity-20"
            />
          </div>
          <div className="relative z-20 flex items-center text-lg font-medium text-white">
            <Image
              src="/gpLOGO.png"
              alt="Logo"
              width={32}
              height={32}
              className="mr-2 dark:invert"
            />
            YABALMA-DASHBOARD
          </div>
        </div>

        {/* Right side with login form */}
        <div className="flex w-full text-white  items-center justify-center md:p-6">
          <div className="mx-auto w-full md:max-w-[505px] max-w-[350px] text-white shadow-2xl space-y-2 p-5 rounded-lg">
            <div className="flex flex-col space-y-2 text-center">
              <h3 className="text-2xl font-semibold tracking-tight">
                Bienvenue sur
              </h3>
              <h1 className="text-4xl font-bold tracking-tight">
                YABALMA-DASHBOARD
              </h1>
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour accéder à votre espace
              </p>
            </div>
            <Login />

            <p className="px-8 text-center text-sm text-muted-foreground">
              En vous connectant, vous acceptez nos{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
