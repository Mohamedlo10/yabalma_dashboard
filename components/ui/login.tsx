"use client";
import { userConnection } from "@/app/api/auth/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { Icon } from 'react-icons-kit';
import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import BeatLoader from "react-spinners/BeatLoader";
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [icon, setIcon] = useState(eyeOff);
  const [type, setType] = useState('password');



  const handleToggle = () => {
    if (type==='password'){
       setIcon(eye);
       setType('text')
    } else {
       setIcon(eyeOff)
       setType('password')
    }
 }



 useEffect(() => {
  // Synchronisez les champs avec l'état local lors du montage
  const storedEmail = (document.getElementById('email') as HTMLInputElement)?.value;
  const storedPassword = (document.getElementById('password') as HTMLInputElement)?.value;

  if (storedEmail) setEmail(storedEmail);
  if (storedPassword) setPassword(storedPassword);
}, []);


    const handleNavigation = () => {
      router.push(`/dashboard`);
    };

    const handleLogin = async (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
    
      try {
        const { data, error }: any = await userConnection(email, password);
        console.log(data)
        if (error) {
          setError(error.message);
        } else if (data) {
          // Redirige vers le tableau de bord
          localStorage.setItem('supabase_session', JSON.stringify(data.user.user_metadata.poste));
          localStorage.setItem('user_session', JSON.stringify(data.user));
          router.push('/dashboard');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      }
      finally{
        setIsLoading(false)

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
    <div className="mx-auto grid text-white  text-bold shadow-2xl h-3/5 p-4 px-20 w-2/3 rounded-sm gap-4">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl  text- font-bold">Login</h1>
            <p className="text-balance font-medium ">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid  gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-white text-black h-14"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center ">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block  text-sm underline "
                >
                  Forgot your password?
                </Link>
              </div>
              <div className=" flex flex-row gap-full">
              <Input id="password" 
               className="bg-white h-14 text-black" 
               type={type}
               placeholder="Password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required>

               </Input>
               <span className="flex justify-around items-center" onClick={handleToggle}>
                  <Icon className="absolute mr-14 text-zinc-500 hover:bg-slate-200 p-1 rounded-full " icon={icon} size={24}/>
              </span>
              </div>
             
            </div>
            <Button type="submit"  className="w-full h-14 mt-2 bg-red-800">
                  Login
            </Button>
            <Button variant="outline" className="w-full h-14 text-black">
              Login with Google
            </Button>
          </form>
          {/* <div className="mb-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div> */}
        </div>
  )
}

export default Login