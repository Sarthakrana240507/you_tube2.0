"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/router";

const socket = io("http://localhost:4000");

export default function OnlineFriends() {
  const router = useRouter();
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    socket.on("update-friends", (list) => {
      setFriends(list);
    });

    socket.emit("join-network", { myId: "sarthak-device" });

    return () => {
      socket.off("update-friends");
    };
  }, []);

  const startCall = (friendId: string) => {
    router.push(`/watch?id=${router.query.id}&call=true&friend=${friendId}`);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Online Friends</h3>

      {friends.length === 0 && (
        <p className="text-gray-400 text-sm">No friends online</p>
      )}

      <div className="flex flex-col gap-2">
        {friends.map((f) => (
          <button
            key={f}
            onClick={() => startCall(f)}
            className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-2 rounded-lg"
          >
            Call Friend ({f})
          </button>
        ))}
      </div>
    </div>
  );
}
