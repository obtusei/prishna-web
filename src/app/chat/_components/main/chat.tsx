"use client";

import * as React from "react";
import { ChevronDown, Reply, Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  sessionUserId: string;
  receiverUserId: string;
  messagesFromDB: any | undefined;
};
export function ChatSection({
  sessionUserId,
  receiverUserId,
  messagesFromDB,
}: Props) {
  const [messages, setMessages] = React.useState(
    messagesFromDB?.map((item: any) => {
      return {
        role: item.senderId == receiverUserId ? "SENDER" : "SESSION_USER",
        content: item.content,
      };
    }) || []
  );
  const [newMessage, setNewMessage] = React.useState("");
  const inputLength = newMessage.trim().length;
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = React.useState();
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
    socket.on("newMessage", (msg) => {
      setMessages((prev: any) => [
        ...prev,
        {
          role: msg.role,
          content: msg.content,
        },
      ]);
    });
    socket.on("typing", (msg) => {
      setIsTyping(msg.isTyping);
    });
    scrollToBottom();

    return () => {
      socket.off("newMessage");
      socket.off("typing");
    };
  }, [messages, isTyping]);

  const sendPrivateMessage = () => {
    if (!newMessage || !receiverUserId) return;
    socket.emit("sendMessage", {
      sender: sessionUserId,
      receiver: receiverUserId,
      content: newMessage,
    });
    setNewMessage("");
    scrollToBottom();
  };

  const sendTypingIndication = (isTyping: boolean) => {
    socket.emit("typing", {
      sender: sessionUserId,
      receiver: receiverUserId,
      isTyping: isTyping,
    });
  };

  return (
    <>
      <div className="pt-20 pb-20 relative px-96">
        <div className="space-y-4 p-4 h-full">
          {messages &&
            messages.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${
                  message.role == "SESSION_USER"
                    ? "justify-end "
                    : "justify-start "
                } gap-1 group`}
              >
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className={`invisible group-hover:visible ${
                    message.role == "SESSION_USER" ? "order-0" : "order-2"
                  }`}
                >
                  <Reply />
                </Button>
                <Popover>
                  {" "}
                  <PopoverTrigger
                    className={`${
                      message.role == "SESSION_USER" ? "order-first" : "order-2"
                    } invisible group-hover:visible`}
                    asChild
                  >
                    <Button variant={"ghost"} size={"icon"}>
                      <Smile className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="p-2 space-x-2 w-fit ">
                    {["❤️", "😂", "😭", "🥲", "💋"].map((item, index) => (
                      <Button
                        size={"icon"}
                        className="rounded-full text-xl"
                        variant={"ghost"}
                        key={index}
                      >
                        {item}
                      </Button>
                    ))}
                  </PopoverContent>
                </Popover>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 relative",
                    message.role === "SESSION_USER"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                  {/* <div className="absolute right-0 -bottom-3 text-sm border bg-white rounde-full px-1 rounded-full">
                    😂
                  </div> */}
                </div>
              </div>
            ))}
          <div
            className={cn(
              " w-max max-w-[75%] gap-1 bg-muted rounded-lg px-3 py-2 text-sm",
              isTyping ? "flex" : "hidden"
            )}
          >
            {[1, 2, 3].map((item, index) => (
              <div
                key={index}
                className="w-2.5 h-2.5 rounded-full animate-pulse bg-gray-400"
              ></div>
            ))}
          </div>
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
            onKeyDown={(e) => {
              sendTypingIndication(true);
            }}
            onKeyUp={(e) => {
              sendTypingIndication(false);
            }}
            onChange={(event) => {
              setNewMessage(event.target.value);
            }}
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
