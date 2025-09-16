import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {};

export default function Sidebar({}: Props) {
  return (
    <div className="fixed right-0 inset-y-0 border-l bg-white w-96 border-r">
      <div className="p-4">
        <h1 className="text-2xl">User Informations</h1>
        <div className="space-y-2 mt-10">Settings</div>
      </div>
    </div>
  );
}
