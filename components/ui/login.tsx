"use client";
import { userConnection } from "@/app/api/auth/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { Icon } from "react-icons-kit";
import { eye } from "react-icons-kit/feather/eye";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import BeatLoader from "react-spinners/BeatLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [icon, setIcon] = useState(eyeOff);
  const [type, setType] = useState("password");

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };

  useEffect(() => {
    // Synchronisez les champs avec l'état local lors du montage
    const storedEmail = (document.getElementById("email") as HTMLInputElement)
      ?.value;
    const storedPassword = (
      document.getElementById("password") as HTMLInputElement
    )?.value;

    if (storedEmail) setEmail(storedEmail);
    if (storedPassword) setPassword(storedPassword);
  }, []);

  const handleNavigation = () => {
    router.push(`/dashboard`);
  };

  const handleLogin = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error }: any = await userConnection(email, password);
      console.log(data);
      if (error) {
        setError(error.message);
      } else if (data) {
        // Redirige vers le tableau de bord
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="sweet-loading">
          <BeatLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col text-white justify-center h-full p-6 sm:p-8 md:p-5 rounded-lg gap-6">
      <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="bg-white text-black h-12 sm:h-14 text-sm sm:text-base"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold">
              Mot de passe
            </Label>
            <Link
              href="#"
              className="text-xs sm:text-sm underline text-gray-300 hover:text-white transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              className="bg-white h-12 sm:h-14 text-black text-sm sm:text-base pr-12"
              type={type}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
              onClick={handleToggle}
            >
              <Icon icon={icon} size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 sm:h-14 mt-2 bg-red-700 hover:bg-red-800 text-sm sm:text-base font-semibold transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}

export default Login;
