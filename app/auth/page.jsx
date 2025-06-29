'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingPage from "@/components/LoadingPage";

const AuthPage = () => {
  const router = useRouter();

  const {login , authState} = useAuth();
  useEffect(() => {
    console.log(authState.isAuth);
    
    if (authState.isAuth) router.push('/')
  } , [authState.isAuth])


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your form submission logic here
    login(formData)
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (authState.loading) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center flex flex-col items-center">
          <Image className="text-center" src="/logo.png" alt="Logo" width={80} height={80} />
          <h2 className="text-3xl font-bold text-gray-900">Bienvenue !</h2>
          {/* <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p> */}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="te  xt"
                  autoComplete="email"
                  required
                  className="block w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          
          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </Button>
          </div>
        </form>

      
      </div>
    </div>
  );
}

export default AuthPage