"use client"

import { useAuth } from "@/store/authStore";
import { Button } from "./ui/button"
import { LogOut } from "lucide-react";

const LogoutButton = () => {

    const {logout} = useAuth();

  return (
   <Button onClick={logout} className="bg-red-500 hover:bg-red-500"><LogOut /> Deconnexion</Button>
  )
}

export default LogoutButton