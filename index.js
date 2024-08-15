import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

let liveUsers = 0;

io.on("connection", (socket) => {
    liveUsers++;
    io.emit("user-count", liveUsers);

    let userName;

    socket.on("set-username", (name) => {
        userName = name;
        io.emit("user-joined", `${userName} has joined the chat.`);
    });

    socket.on("user-message", (message) => {
        io.emit("message", { user: userName, message: message });
    });

    socket.on("image", (imageData) => {
        io.emit("image", { user: userName, image: imageData });
    });

    socket.on("video", (videoData) => {
        io.emit("video", { user: userName, video: videoData });
    });
    socket.on("audio", (data) => {
        io.emit("audio", data);
    });


    socket.on("disconnect", () => {
        liveUsers--;
        io.emit("user-count", liveUsers);
        if (userName) {
            io.emit("user-left", `${userName} has left the chat.`);
        }
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

app.use(express.static(publicDir));

app.get("/", (req, res) => {
    return res.sendFile(path.join(publicDir, "index.html"));
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
