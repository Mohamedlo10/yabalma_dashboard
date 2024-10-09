import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
// import { useRouter } from 'next/navigation';



function Login() {
    // const router = Router();
    
  return (
    <div className="mx-auto grid text-white  text-bold shadow-2xl h-3/5 p-4 px-20 w-2/3 rounded-sm gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl text- font-bold">Login</h1>
            <p className="text-balance font-medium ">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid  gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-white text-black"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center ">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline "
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" className="bg-white text-black" type="password"  placeholder="Password" required />
            </div>
            <Button type="submit" className="w-full mt-4 bg-red-800">
            <Link
                  href="/dashboard"
                  className=" text-base"
                >
                  Login
                </Link>
            </Button>
            <Button variant="outline" className="w-full text-black">
              Login with Google
            </Button>
          </div>
          <div className="my-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </div>
  )
}

export default Login