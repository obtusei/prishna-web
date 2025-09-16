"use client";

import React from "react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

type Props = {};

export default function SignOutButton({}: Props) {
  return (
    <Button
      onClick={async () => {
        await authClient.signOut();
      }}
      variant={"ghost"}
      className="text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 active:text-red-800"
    >
      Sign Out <LogOut />
    </Button>
  );
}
