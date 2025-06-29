"use client";
import "@/app/globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { set } from "date-fns";
import LoadingPage from "@/components/LoadingPage";

export default function RootLayout({ children }) {
  const router = useRouter();
  const { authState } = useAuth();
  const laodUser = useAuth((state) => state.laodUser);

  useEffect(() => {
    laodUser();
    if (!authState?.isAuth) {
      router.push("/auth");
    }
  }, [authState.isAuth]);

  if (authState.loading) {
    return (
      <html lang="en">
        <body className="loading">
          <LoadingPage />
          <Toaster />
        </body>
      </html>
    );
    
  }

  if (!authState.isAuth) {
    return (
      <html lang="en">
        <body className="">
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="">
        <SidebarProvider>
          <AppSidebar />
          <main className="p-5 w-full">
            <SidebarTrigger />
            {children}
            <Toaster />
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
