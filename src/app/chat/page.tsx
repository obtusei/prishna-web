import Users from "./_components/users";
import Connection from "./_components/connection";
import MainSection from "./_components/main";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import api from "@/lib/axios";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = (await searchParams).user;
  const session = await auth.getSession();
  if (!session) redirect("/login");
  const { data: currentUser } = await api.get("/api/chats");
  const currentChat = userId
    ? currentUser?.chats.find((chat: any) =>
        chat.members.some((mem: any) => mem.id === userId)
      )
    : undefined;
  return (
    <>
      <div className="min-h-screen relative flex flex-col justify-end">
        <Users sessionId={currentUser?.id}>
          <Connection />
        </Users>
        <MainSection
          sessionUserId={session.user.id}
          receiverUserId={userId}
          currentChat={currentChat}
        />
      </div>
    </>
  );
}
