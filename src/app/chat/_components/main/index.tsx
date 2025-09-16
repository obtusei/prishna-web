import React from "react";
import Header from "./header";
import { ChatSection } from "./chat";
import Sidebar from "./user-sidebar";
import prisma from "@/prisma";
import { notFound } from "next/navigation";
import { Prisma } from "@/generated/prisma";

type Props = {
  sessionUserId: string;
  receiverUserId?: string | string[] | undefined;
  currentChat:
    | Prisma.ChatGetPayload<{
        include: {
          messages: true;
          members: true;
        };
      }>
    | undefined;
};

export default async function MainSection({
  sessionUserId,
  receiverUserId,
  currentChat,
}: Props) {
  if (!receiverUserId)
    return (
      <div className="pl-96 p-10 h-screen flex items-center justify-center text-center">
        <p className="opacity-60 text-sm">Find a friend to chat with.</p>
      </div>
    );

  const findUser = await prisma.user.findUnique({
    where: {
      id: String(receiverUserId),
    },
  });
  if (!findUser) notFound();
  return (
    <div>
      <Header user={findUser} sessionUserId={sessionUserId} />
      <ChatSection
        messagesFromDB={currentChat?.messages}
        sessionUserId={sessionUserId}
        receiverUserId={String(receiverUserId)}
      />
      <Sidebar />
    </div>
  );
}
