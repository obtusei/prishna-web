"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Prisma } from "@/generated/prisma";
import { socket } from "@/socket";
import { Phone, Video } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
  sessionUserId: string;
  user: Prisma.UserGetPayload<{}>;
};

export default function Header({ sessionUserId, user }: Props) {
  return (
    <div className="fixed bg-white inset-x-96 justify-between top-0 p-5 border-b shadow flex flex-row items-center">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/01.png" alt="Image" />
          <AvatarFallback>
            {user.name.charAt(0).toUpperCase() +
              user.name.charAt(1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Button variant={"ghost"} size={"icon"}>
          <Phone />
        </Button>{" "}
        <Button variant={"ghost"} size={"icon"} asChild>
          <Link href={`/call?userId=${user.id}`}>
            <Video />
          </Link>
        </Button>
      </div>
    </div>
  );
}
