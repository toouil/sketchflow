require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const parser = require('socket.io-msgpack-parser')

const CLIENT_URL = process.env.CLIENT_URL

app.use(
  cors({
    origin: [CLIENT_URL]
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  parser,
  cors: {
    origin: [CLIENT_URL],
  },
});

io.on("connection", (socket) => {
  socket.on("getElements", (data) => {
    console.log("object");
    socket.broadcast.emit("setElements", data);
  });
});

app.get("/", (req, res) => {
  res.send(`<marquee>To try the app visite : <a href="${CLIENT_URL}">${CLIENT_URL}</a></marquee>`);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log("Server running in port : " + PORT);
});
