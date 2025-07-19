"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import axios from 'axios';
import { thirdFont } from '@/fonts';
import { FaGoogle } from "react-icons/fa";
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { BadgeAlert } from 'lucide-react';


 function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    setRedirectPath(redirect);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });

      if (response.status === 201) {
        //
        //  Use router.push for client-side navigation
        router.push('/verification');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignUp= () =>{
    signIn('google', { callbackUrl: '/account' });
  } 

  return (
    <div className=" bg-patternPinkey ">
    <div className='md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)]  flex items-center justify-center bg-black/30 backdrop-blur-[3px] py-12 px-4 sm:px-6 lg:px-8'>
  {/* <div className='md:h-[calc(100vh-128px)] h-[calc(100vh-64px)] bg-black/30 backdrop-blur-[3px] flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'> */}
      <div className="max-w-md rounded-2xl bg-creamey shadow-2xl w-full py-3 px-6 space-y-4">
        <div>
          <h2 className={`${thirdFont.className} mt-6 text-center text-4xl font-bold tracking-normal text-lovely`}>
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4 ">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none placeholder:text-lovely/90 relative block w-full px-3 py-2 border border-pinkey  text-lovely/90 rounded-t-md focus:outline-none focus:ring-primary bg-creamey/90 focus:border-pinkey focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none placeholder:text-lovely/90 bg-creamey/90 rounded-none relative block w-full px-3 py-2 border border-pinkey placeholder-gray-500 text-lovely/90 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none placeholder:text-lovely/90 relative block w-full px-3 py-2 border border-pinkey bg-creamey text-lovely/90 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-lovely flex gap-2 w-full justify-center items-center text-sm text-center">{error} <span className='text-xs'><BadgeAlert className='text-xs w-5'/></span></div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border-2 border-creamey text-sm  rounded-md text-creamey bg-lovely font-semibold hover:bg-everGreen/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        <div className="relative flex my-6">
          <div className="w-full inset-0 flex items-center">
            <div className="w-full border-t border-pinkey"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-lovely whitespace-nowrap">Or</span>
          </div>
          <div className="w-full inset-0 flex items-center">
            <div className="w-full border-t border-pinkey"></div>
          </div>
        </div>
        
        <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border-2 border-creamey text-sm  rounded-md text-creamey bg-lovely font-semibold hover:bg-everGreen/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account with Google...' : 'Create your account with Google'}
              <span className='ml-2'><FaGoogle />
              </span>
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-lovely">
              Already have an account?{' '}
              <Link  href="/login" className="font-medium underline text-lovely/90 hover:text-lovely/90">
                Sign in here
              </Link>
            </p>
          </div>
      </div>
      </div>
    </div>
  );
} 

export default function PlaylistPageWrapper(){
  return <Suspense fallback={<div>Loading</div>}>
       <RegisterPage />
     </Suspense>
 }