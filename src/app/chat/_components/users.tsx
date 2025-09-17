import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { cookies } from "next/headers";
import Link from "next/link";
import React, { ReactNode } from "react";

type Props = {
  sessionId: string | undefined;
  children: ReactNode;
};

export default async function Users({ sessionId, children }: Props) {
  const cookieStore = await cookies();
  const { data: suggestionUsers } = await api.get(
    "http://localhost:4000/api/user/all"
  );
  const { data: chats } = await api.get(
    "http://localhost:4000/api/user/chatted"
  );

  return (
    <div className="fixed left-0 inset-y-0 bg-white w-96 border-r">
      {children}
      <div className="p-4">
        <h1 className="text-5xl">Chats</h1>
        <div className="mt-10">
          <h1 className="text-xs font-semibold uppercase opacity-60">
            Friends
          </h1>
          <div className="space-y-2 ">
            {chats &&
              chats.map((chat: any, index: number) => (
                <Link
                  href={`/chat?user=${chat.id}`}
                  key={index}
                  className="flex p-4 gap-2 items-start cursor-pointer  hover:bg-gray-100 rounded-2xl"
                >
                  <Avatar className="size-10">
                    <AvatarImage src={"https:github.com/obtusei.png"} />
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-0 flex-col leading-tight">
                    <span className="text-lg">{chat.name}</span>
                    <span className="text-sm">
                      {/* {chat.messages.length > 0
                        ? chat.messages[0].content
                        : `Send "Hi" to ${chat.name}`} */}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        <div className="mt-10">
          <h1 className="text-xs font-semibold uppercase opacity-60">
            Suggestions
          </h1>
          <div className="space-y-2 ">
            {suggestionUsers.map((item: any, index: number) => (
              <Link
                href={`/chat?user=${item.id}`}
                key={index}
                className="flex p-4 gap-2 items-start cursor-pointer  hover:bg-gray-100 rounded-2xl"
              >
                <Avatar className="size-10">
                  <AvatarImage src={"https:github.com/obtusei.png"} />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div className="flex gap-0 flex-col leading-tight">
                  <span className="text-lg">{item.name}</span>
                  <span className="text-sm">{item.email}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
