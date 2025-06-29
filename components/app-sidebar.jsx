import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { links, otherUrls } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Image src="/logo.png" alt="Logo" width={70} height={70} />
          <SidebarGroupLabel>System de gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton>
                    <Link
                      href={item.url}
                      className="w-full flex items-center gap-2 text-sm text-black"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <hr />
              {otherUrls.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton>
                    <Link
                      href={item.url}
                      className="w-full flex items-center gap-2 text-sm text-black"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          <LogoutButton className="w-full">Logout</LogoutButton>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
