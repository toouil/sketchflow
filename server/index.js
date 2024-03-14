require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const CLIENT_URL = process.env.CLIENT_URL

app.use(
  cors({
    origin: [CLIENT_URL]
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL],
  },
});

io.on("connection", (socket) => {
  socket.on("send-elements", (data) => {
    socket.broadcast.emit("receive-elements", data);
  });
});

app.get("/", (req, res) => {
  res.send(`<marquee>To try the app visite : <a href="${CLIENT_URL}">${CLIENT_URL}</a></marquee>`);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log("Server running in port : " + PORT);
});
