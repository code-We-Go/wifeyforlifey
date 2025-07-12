"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { thirdFont } from '@/fonts';
import { FaGoogle } from "react-icons/fa";
import { BadgeAlert } from 'lucide-react';
import { bgCreameyButton, bgRedButton } from '../constants';


 function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const searchParams = useSearchParams();

  
  const handleGoogleSignIn = () => {
    const callbackUrl = redirectPath ? `/${redirectPath}` : '/account';
    signIn('google', { callbackUrl });
  };

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    setRedirectPath(redirect);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        if (redirectPath) {
          router.push(`/${redirectPath}`);
        } else {
          router.push('/account');
        }
      }
    } catch (error: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className=" bg-pinkey ">
        <div className='md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)]  flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'>
        {/* <div className='md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)] bg-black/30 backdrop-blur-[3px] flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'> */}
        <div className="max-w-md max-h-[90vh] rounded-2xl bg-creamey shadow-2xl w-full py-8 px-6 space-y-8">
          <div>
            <h2 className={`${thirdFont.className} mt-6 text-center text-4xl font-bold tracking-normal text-lovely`}>
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4 ">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="placeholder:text-pinkey rounded-none border-pinkey relative block w-full px-3 py-2 border-2 bg-creamey/90  text-lovely/90 rounded-t-md focus:outline-none focus:ring-everGreen focus:border-primary focus:z-10 sm:text-sm"
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
                  className="placeholder:text-pinkey rounded-none border-pinkey relative block w-full px-3 py-2 border-2 bg-creamey/90  text-lovely/90 rounded-t-md focus:outline-none focus:ring-everGreen focus:border-primary focus:z-10 sm:text-sm"
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
                className={`group relative  w-full flex justify-center py-2 px-4 border border-transparent text-sm  rounded-md ${bgCreameyButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="relative flex my-6">
            <div className="w-full inset-0 flex items-center">
              <div className="w-full border-t border-lovely"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-lovely whitespace-nowrap">Or</span>
            </div>
            <div className="w-full inset-0 flex items-center">
              <div className="w-full border-t border-lovely"></div>
            </div>
          </div>
          <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`group relative  w-full flex justify-center py-2 px-4 border border-transparent  rounded-md ${bgCreameyButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Signing in with Google ..' : 'Sign in with Google'}
                {!loading &&               <span className='ml-2'><FaGoogle />
                  </span>}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-lovely">
                Don&apos;t have an account?{' '}
                <a href="/register" className="font-medium underline">
                  Sign up here
                </a>
              </p>
            </div>
        </div>
        </div>
      </div>
  );
} 

export default function PlaylistPageWrapper(){
  return <Suspense fallback={<div>Loading</div>}>
       <LoginPage />
     </Suspense>
 } 