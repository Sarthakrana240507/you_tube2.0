"use client";

import React, { useRef, useState, useEffect } from "react";
import Peer from "peerjs";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { Video, Monitor, Mic, MicOff, VideoOff, PhoneOff, Circle, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

// Connect to signaling server
const socket = io("http://localhost:4000");

interface CallProps {
  myId: string;
  friendId: string;
}

export default function VideoCall({ myId, friendId }: CallProps) {
  const router = useRouter();
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const friendVideoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<any>(null);
  const currentCallRef = useRef<any>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Initialize PeerJS and Local Stream
  useEffect(() => {
    const p = new Peer(myId, {
      host: "0.peerjs.com",
      port: 443,
      secure: true
    });

    setPeer(p);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMediaStream(stream);
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        toast.error("Could not access camera/mic");
      });

    // Handle Incoming Calls
    p.on("call", (incomingCall) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        incomingCall.answer(stream);
        currentCallRef.current = incomingCall;
        incomingCall.on("stream", (remoteStream) => {
          if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
        });
      });
    });

    return () => {
      p.destroy();
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  }, [myId]);

  // Initiate Call
  const toggleCall = () => {
    if (!peer || !mediaStream) return;
    toast.info(`Calling friend: ${friendId}...`);

    const call = peer.call(friendId, mediaStream);
    currentCallRef.current = call;

    call.on("stream", (remoteStream) => {
      if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
      toast.success("Connected!");
    });

    call.on("error", (err) => {
      console.error("Call error:", err);
      toast.error("Call failed or recipient not available");
    });
  };

  // Screen Sharing Logic (YouTube Website Sharing)
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as any,
          audio: true
        });

        setIsScreenSharing(true);
        updateStream(screenStream);

        // Handle "Stop Sharing" button from browser
        screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = async () => {
    const originalStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setIsScreenSharing(false);
    updateStream(originalStream);
  };

  const updateStream = (newStream: MediaStream) => {
    setMediaStream(newStream);
    if (myVideoRef.current) myVideoRef.current.srcObject = newStream;

    // If call is active, replace video track for Peer
    if (currentCallRef.current && currentCallRef.current.peerConnection) {
      const videoTrack = newStream.getVideoTracks()[0];
      const sender = currentCallRef.current.peerConnection.getSenders().find((s: any) => s.track.kind === "video");
      if (sender) sender.replaceTrack(videoTrack);
    }
  };

  // Recording Feature (RecordRTC)
  const toggleRecording = async () => {
    if (!mediaStream) return;

    if (!isRecording) {
      const RecordRTC = (await import("recordrtc")).default;
      recorderRef.current = new RecordRTC(mediaStream, {
        type: "video",
        mimeType: "video/webm",
      });
      recorderRef.current.startRecording();
      setIsRecording(true);
      toast.success("Recording started...");
    } else {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current.getBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `YourTube-Session-${Date.now()}.webm`;
        a.click();
        setIsRecording(false);
        toast.success("Recording saved to local!");
      });
    }
  };

  const toggleMute = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white animate-in fade-in zoom-in duration-300">

      {/* HEADER */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-xl font-bold tracking-tight">Live Session</h2>
      </div>

      <div className="absolute top-8 right-8 text-sm opacity-50 font-mono">
        ID: {myId}
      </div>

      {/* VIDEO GRID */}
      <div className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Friend's Video (Large) */}
        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
          <video ref={friendVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-semibold border border-white/10">
            Participant
          </div>
          {!friendVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-zinc-500 text-sm">Waiting for connection...</p>
            </div>
          )}
        </div>

        {/* My Video (Self View) */}
        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
          <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-semibold border border-white/10">
            You {isMuted && "(Muted)"}
          </div>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="mt-12 flex items-center gap-4 bg-zinc-800/80 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">

        <button
          onClick={toggleMute}
          className={`p-4 rounded-2xl transition-all ${isMuted ? "bg-red-500 text-white" : "bg-white/5 hover:bg-white/10 text-white"}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all ${isVideoOff ? "bg-red-500 text-white" : "bg-white/5 hover:bg-white/10 text-white"}`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <button
          onClick={toggleCall}
          className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all flex items-center gap-2 font-bold px-6"
        >
          <Share2 size={24} /> Start Call
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-2xl transition-all ${isScreenSharing ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10 text-white"}`}
          title="Share YouTube Screen"
        >
          <Monitor size={24} />
        </button>

        <button
          onClick={toggleRecording}
          className={`p-4 rounded-2xl transition-all ${isRecording ? "bg-red-500 animate-pulse text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-white/5 hover:bg-white/10 text-white"}`}
        >
          {isRecording ? <Download size={24} /> : <Circle size={24} fill="currentColor" />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <button
          onClick={() => router.back()}
          className="p-4 bg-zinc-500 hover:bg-red-600 text-white rounded-2xl transition-all"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {/* FOOTER INFO */}
      <p className="mt-8 text-zinc-500 text-xs font-medium"> Secure Peer-to-Peer Encryption Active </p>
    </div>
  );
}
