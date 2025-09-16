import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Prisma } from "@/generated/prisma";
import prisma from "@/prisma";
import Link from "next/link";
import React, { ReactNode } from "react";

type Props = {
  sessionId: string | undefined;
  chats:
    | Prisma.ChatGetPayload<{
        include: {
          messages: true;
        };
      }>[]
    | undefined;
  children: ReactNode;
};

export default async function Users({ sessionId, chats, children }: Props) {
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: sessionId,
      },
    },
    include: {
      chats: true,
    },
  });
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
              chats.map((chat, index) => (
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
                    <span className="text-lg">{chat.id}</span>
                    <span className="text-sm">
                      {new Date(chat.createdAt).toLocaleDateString()}
                      {/* {chat.content.length > 0 ? chat.content[0].content : ""} */}
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
            {users.map((item, index) => (
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
