import Users from "./_components/users";
import Connection from "./_components/connection";
import MainSection from "./_components/main";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = (await searchParams).user;
  const session = await auth.getSession();
  if (!session) redirect("/login");
  const currentUser = await prisma.user.findUnique({
    where: {
      id: session?.user.id,
    },
    include: {
      chats: {
        include: {
          members: true,
          messages: true,
        },
      },
    },
  });
  const currentChat = userId
    ? currentUser?.chats.find((chat) =>
        chat.members.some((mem) => mem.id === userId)
      )
    : undefined;
  return (
    <>
      {JSON.stringify(currentUser)}
      <div className="min-h-screen relative flex flex-col justify-end">
        <Users sessionId={currentUser?.id} chats={currentUser?.chats}>
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
