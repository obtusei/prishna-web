"use client";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { socket } from "@/socket";
type Props = {};

export default function IncomingCall({}: Props) {
  const [openCallDialog, setOpenCallDialog] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null);
  const userId = "";
  useEffect(() => {
    // incoming offer from another user
    socket.on("incoming-call", async ({ fromUserId, offer }) => {
      setOpenCallDialog(true);
      console.log("Incoming call from", fromUserId);
      setIncomingCallFrom(fromUserId);

      // store the remote offer until user accepts
      // Save it on ref so accept handler can access
      (window as any).__incomingOffer = { fromUserId, offer };
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [openCallDialog]);

  function declineCall() {
    const incoming = (window as any).__incomingOffer;
    if (!incoming) return;
    const { fromUserId } = incoming;
    socket.emit("end-call", { fromUserId: userId, toUserId: fromUserId });
    setIncomingCallFrom(null);
    setOpenCallDialog(false);
    delete (window as any).__incomingOffer;
  }

  function acceptCall() {}

  return (
    <div>
      <AlertDialog
        open={openCallDialog}
        onOpenChange={(open) => setOpenCallDialog(open)}
      >
        <AlertDialogTrigger asChild>
          {/* <Button variant="outline">Show Dialog</Button> */}
        </AlertDialogTrigger>
        <AlertDialogContent className="w-fit min-w-xs bg-white border-[0.5px] backdrop-blur-xl">
          <AlertDialogHeader className="sm:text-center flex items-center justify-center">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage
                  src={"https://github.com/obtusei.png"}
                ></AvatarImage>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <div className="-z-20 absolute inset-0 origin-center animate-ping flex items-center justify-center rounded-full ">
                <div className="w-3/5 h-3/5 bg-black rounded-full"></div>
              </div>
            </div>
            <div className="">
              <AlertDialogTitle className="text-3xl ">Prishna</AlertDialogTitle>
              <p className="opacity-60">Is calling you...</p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-8 items-center justify-center sm:justify-center mt-10 flex">
            <Button onClick={declineCall} variant={"destructive"} className="">
              <Phone className="rotate-[135deg]" /> End Call
            </Button>
            <Button
              onClick={acceptCall}
              className=" bg-green-600 hover:bg-green-700 active:bg-green-800"
            >
              <Phone className="" /> Accept Call
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
