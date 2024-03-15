//server side

import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import {} from "cors";
import formatMessage from "./utils/messages.js";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "./utils/users.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = 3000 || process.env.PORT;

//set static folder
app.use(express.static(path.join(path.resolve(), "public")));

const botname = "Bot";

//run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    
    const user = userJoin(socket.id, username, room);
    //user join return an object with {id,usn,room}

    socket.join(user.room);

    //welcome current user
    socket.emit(
      "message",
      formatMessage(botname, "Welcome to our chatting application")
    );

    //braodcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} has joined the chat`)
      );

    //send users and room info
    // here we use io , means send to all the users(sockets) in that particular room , so that the room name and the members are visible in the room

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// app.get("/",(req,res)=>{
//     res.send("hellow this is the home page");
// })

server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
