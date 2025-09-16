import Link from "next/link";
import React from "react";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <div className="absolute right-0">
      <img src="/nav_paper.png" alt="" className="absolute -top-5 -z-10" />
      <div className="bg-cover p-10 text-black bg-no-repeat">
        <ul className="flex text-2xl items-center gap-10">
          <li>
            <Link href={"/letters"}>Letters</Link>
          </li>
          <li>Messages</li>
          <li>Memories</li>
          <li>Tryouts</li>
          <li>Login</li>
        </ul>
      </div>
    </div>
  );
}
