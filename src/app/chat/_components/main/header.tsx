import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  sessionUserId: string;
  user: any;
};

export default function Header({ sessionUserId, user }: Props) {
  return (
    <div className="fixed bg-white inset-x-96 justify-between top-0 p-5 border-b shadow flex flex-row items-center">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/01.png" alt="Image" />
          <AvatarFallback>
            {user.name.charAt(0).toUpperCase() +
              user.name.split(" ")[1].charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Button variant={"ghost"} size={"icon"}>
          <Link target="_blank" href={`/call?userId=${user.id}`}>
            <Phone />
          </Link>
        </Button>{" "}
        <Button variant={"ghost"} size={"icon"} asChild>
          <Link target="_blank" href={`/call?userId=${user.id}&video=on`}>
            <Video />
          </Link>
        </Button>
      </div>
    </div>
  );
}
