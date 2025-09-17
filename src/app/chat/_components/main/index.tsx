import React from "react";
import Header from "./header";
import { ChatSection } from "./chat";
import Sidebar from "./user-sidebar";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import api from "@/lib/axios";

type Props = {
  sessionUserId: string;
  receiverUserId?: string | string[] | undefined;
  currentChat: any | undefined;
};

export default async function MainSection({
  receiverUserId,
  sessionUserId,
  currentChat,
}: // sessionUserId,
// receiverUserId,
Props) {
  if (!receiverUserId)
    return (
      <div className="pl-96 p-10 h-screen flex items-center justify-center text-center">
        <p className="opacity-60 text-sm">Find a friend to chat with.</p>
      </div>
    );

  const findUser = await api.get(
    `http://localhost:4000/api/user/${receiverUserId}`
  );
  if (!findUser) notFound();
  return (
    <div>
      <Header user={findUser.data} sessionUserId={sessionUserId} />
      <ChatSection
        messagesFromDB={currentChat?.messages}
        sessionUserId={sessionUserId}
        receiverUserId={String(receiverUserId)}
      />
      <Sidebar />
    </div>
  );
}
