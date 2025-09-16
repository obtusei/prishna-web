import SignOutButton from "@/components/signout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";

export default async function Home() {
  const session = await auth.getSession();
  if (!session) {
    return <div>Not authenticated</div>;
  }
  return (
    <div className="">
      <div className="">
        <div className="p-10 flex w-full items-center justify-between relative">
          <h1 className="text-2xl font-serif font-bold italic z-10 text-black">
            Prishna
          </h1>
          <SignOutButton />
        </div>
        <pre className="border-2 w-fit border-green-600 bg-green-50 text-green-700 m-10 p-10 rounded-2xl">
          <b>User:</b>
          <br />
          {JSON.stringify(session.user, null, 2)}
          <br />
          <br />
          <b>Session:</b>
          <br />
          {JSON.stringify(session.session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
