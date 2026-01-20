import { Server } from "socket.io";

const io = new Server(process.env.PORT || 4000, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("call-user", ({ userToCall, signalData, from }) => {
    io.to(userToCall).emit("call-made", { signal: signalData, from });
  });

  socket.on("answer-call", ({ to, signal }) => {
    io.to(to).emit("call-answered", { signal });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

console.log("VoIP Signaling Server running on port 4000");
