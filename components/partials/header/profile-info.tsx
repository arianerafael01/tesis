
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import { Link } from '@/i18n/routing';
import { useSession } from "next-auth/react";

const ProfileInfo = () => {
  const { data: session } = useSession();
  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">

            <Image
              src="/images/institutional-logo.png"
              alt="Instituto Técnico Etchegoyen"
              width={36}
              height={36}
              className="rounded-full"
            />

            <div className="text-sm font-medium  capitalize lg:block hidden  ">
              {session?.user?.name}
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">

            <Image
              src="/images/institutional-logo.png"
              alt="Instituto Técnico Etchegoyen"
              width={36}
              height={36}
              className="rounded-full"
            />

            <div>
              <div className="text-sm font-medium text-default-800 capitalize ">
                {session?.user?.name}
              </div>
              <div className="text-xs text-default-600">
                {session?.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem 
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer"
          >
            <Icon icon="heroicons:power" className="w-4 h-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default ProfileInfo;
