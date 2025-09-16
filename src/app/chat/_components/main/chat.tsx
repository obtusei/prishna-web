"use client";

import * as React from "react";
import { ChevronDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Prisma } from "@/generated/prisma";
import { socket } from "@/socket";

type Props = {
  sessionUserId: string;
  receiverUserId: string;
  messagesFromDB: Prisma.MessageGetPayload<{}>[] | undefined;
};
export function ChatSection({
  sessionUserId,
  receiverUserId,
  messagesFromDB,
}: Props) {
  const [messages, setMessages] = React.useState(
    messagesFromDB?.map((item) => {
      return {
        role: item.senderId == receiverUserId ? "SENDER" : "SESSION_USER",
        content: item.content,
      };
    }) || []
  );
  const [newMessage, setNewMessage] = React.useState("");
  const inputLength = newMessage.trim().length;
  const role = "user"; //change this
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;

      // Show if more than 200px away from bottom
      setIsScrolled(distanceFromBottom > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    // socket.emit("register", username);
    socket.on("newPrivateMessage", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          role: msg.role,
          content: msg.content,
        },
      ]);
    });
    scrollToBottom();

    return () => {
      socket.off("newPrivateMessage");
    };
  }, [messages]);

  const sendPrivateMessage = () => {
    if (!newMessage || !receiverUserId) return;
    console.log(`New message: ${newMessage}`);
    console.log(`Receiver User ID: ${receiverUserId}`);
    socket.emit("sendPrivateMessage", {
      sender: sessionUserId,
      receiver: receiverUserId,
      content: newMessage,
    });
    console.log(newMessage);
    setNewMessage("");
    scrollToBottom();
  };

  return (
    <>
      <div className="pt-20 pb-20 px-96">
        <div className="space-y-4 p-4 h-full">
          {messages &&
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "SESSION_USER"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div
        className={`${
          isScrolled ? "fixed" : "hidden"
        } inset-x-0 flex justify-center bottom-20`}
      >
        <Button onClick={scrollToBottom} variant={"secondary"}>
          See Below <ChevronDown />
        </Button>
      </div>
      <div className="fixed bottom-0 bg-white inset-x-96 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendPrivateMessage();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
          />
          <Button type="submit" size="icon" disabled={inputLength === 0}>
            <Send />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </>
  );
}
