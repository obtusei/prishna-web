"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { Mic, Phone, Video } from "lucide-react";
import { notFound, redirect, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
// import { socket } from "@/lib/socket";

type Props = {
  userId: string; // current logged-in user id
};

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const params = useSearchParams();

  const [targetUserId, setTargetUserId] = useState<string>(
    params.get("userId") || ""
  );
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  // STUN servers — add TURN for production
  const [audio] = useState(new Audio("/outgoing_call.mp3"));
  const RTC_CONFIG = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  async function sessionUser() {
    const sessionUser = await authClient.getSession();
    if (sessionUser.data) {
      setUserId(sessionUser.data?.user.id);
    }
  }

  useEffect(() => {
    // register socket presence on connect
    setTargetUserId(params.get("userId") || "");
    sessionUser();
    if (userId) {
      socket.emit("register", userId);
    }

    startCall();

    // // incoming offer from another user
    // socket.on("incoming-call", async ({ fromUserId, offer }) => {
    //   console.log("Incoming call from", fromUserId);
    //   setIncomingCallFrom(fromUserId);

    //   // store the remote offer until user accepts
    //   // Save it on ref so accept handler can access
    //   (window as any).__incomingOffer = { fromUserId, offer };
    // });

    // when callee answers
    socket.on("call-answered", async ({ fromUserId, answer }) => {
      console.log("Call answered by", fromUserId);
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // incoming ICE candidate from remote
    socket.on("ice-candidate", async ({ fromUserId, candidate }) => {
      if (!candidate) return;
      try {
        const pc = pcRef.current;
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding remote ICE candidate", err);
      }
    });

    // other user ended call
    socket.on("call-ended", ({ fromUserId }) => {
      console.log("Call ended by", fromUserId);
      endCallLocal();
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [userId]);

  async function getLocalStream() {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Error getting userMedia", err);
      throw err;
    }
  }

  function createPeerConnection(toUserId: string) {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    // add local tracks
    const localStream = localStreamRef.current;
    if (localStream) {
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
    }

    // on remote track
    pc.ontrack = (event) => {
      console.log("ontrack", event);
      if (remoteVideoRef.current) {
        // some browsers provide multiple streams; use first
        remoteVideoRef.current.srcObject = event.streams[0] ?? event.streams;
      }
    };

    // gather local ICE candidates and send to remote via signaling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          fromUserId: userId,
          toUserId,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  }

  // Caller initiates a call
  async function startCall() {
    if (!targetUserId) redirect("/");
    setIsCalling(true);

    await getLocalStream();
    const pc = createPeerConnection(targetUserId);

    // create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // send offer to callee via server
    socket.emit("call-user", {
      fromUserId: userId,
      toUserId: targetUserId,
      offer: pc.localDescription, // SDP
    });
  }

  // Callee accepts the incoming call
  async function acceptCall() {
    const incoming = (window as any).__incomingOffer;
    if (!incoming) return;

    const { fromUserId, offer } = incoming;
    setIncomingCallFrom(null);

    await getLocalStream();
    const pc = createPeerConnection(fromUserId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // send answer back
    socket.emit("answer-call", {
      fromUserId: userId, // me
      toUserId: fromUserId,
      answer: pc.localDescription,
    });

    setIsCalling(true);

    // cleanup stored incoming offer
    delete (window as any).__incomingOffer;
  }

  // Decline incoming call
  function declineCall() {
    const incoming = (window as any).__incomingOffer;
    if (!incoming) return;
    const { fromUserId } = incoming;
    socket.emit("end-call", { fromUserId: userId, toUserId: fromUserId });
    setIncomingCallFrom(null);
    delete (window as any).__incomingOffer;
  }

  // End the current call locally and notify peer
  function endCall() {
    const pc = pcRef.current;
    // send end event to remote if we know target
    if (pc && pc.signalingState) {
      // best-effort: notify remote (use targetUserId or incomingCallFrom)
      const other = targetUserId || (window as any).__currentCallWith;
      if (other)
        socket.emit("end-call", { fromUserId: userId, toUserId: other });
    }
    endCallLocal();
  }

  // local cleanup
  function endCallLocal() {
    setIsCalling(false);
    try {
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((s) => {
          try {
            if (s.track) s.track.stop();
          } catch (e) {}
        });
        pcRef.current.close();
      }
    } catch (e) {
      console.warn("Error cleaning pc", e);
    }
    pcRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // reset stored states
    delete (window as any).__incomingOffer;
    (window as any).__currentCallWith = null;
    // setTargetUserId("");
    redirect("/");
  }

  return (
    <div className="relative overflow-hidden">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-screen min-h-screen bg-black "
      />
      <div
        className={`w-full absolute inset-0 bg-red-950 ${
          isCalling ? "flex" : "hidden"
        } flex-col gap-4 justify-center items-center text-center `}
      >
        <Avatar className="size-24">
          <AvatarImage src={"https://github.com/obtusei.png"}></AvatarImage>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <div className="text-white">
          <h1 className="text-3xl ">Prishna {targetUserId}</h1>
          <p className="opacity-60">Calling...</p>
        </div>
      </div>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="h-64 aspect-video rounded-2xl absolute top-10 right-10"
      />
      <div className="fixed bottom-10  inset-x-0 flex items-center justify-center">
        <div className="mb-4 bg-white/40 backdrop-blur-2xl flex gap-8 p-6 rounded-full">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="scale-150 rounded-full"
          >
            <Mic />
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="scale-150 rounded-full"
          >
            <Video />
          </Button>
          <Button
            variant={"destructive"}
            onClick={endCall}
            disabled={!isCalling}
            className="scale-150 rounded-full"
          >
            <Phone className="rotate-[135deg]" />
          </Button>
        </div>
      </div>

      {incomingCallFrom && (
        <div className="fixed bottom-4 right-4 bg-white shadow p-4 rounded">
          <p>Incoming call from: {incomingCallFrom}</p>
          <button
            onClick={acceptCall}
            className="mr-2 px-3 py-1 bg-green-600 text-white"
          >
            Accept
          </button>
          <button
            onClick={declineCall}
            className="px-3 py-1 bg-red-600 text-white"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
