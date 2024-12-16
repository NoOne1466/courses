const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: `./config.env` });

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require(`./app.js`);
const Chat = require("./models/chatModel.js");
const User = require("./models/userModel.js");
const Instructor = require("./models/instructorModel.js");
const chatController = require("./controllers/chatController.js");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(console.log("DB Connection"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.message, err.name);
  console.log("UNHANDLED REJECTION");
  server.close(() => {
    process.exit(1);
  });
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Handle joining a chat room
  socket.on("joinRoom", ({ chatId }) => {
    socket.join(chatId);
    console.log(`Client joined room: ${chatId}`);
  });

  // Handle sending messages
  socket.on(
    "chatMessage",
    async ({ chatId, senderId, senderType, message }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.error(`Chat with ID ${chatId} not found`);
          return;
        }

        // Push the new message to the chat's message array
        chat.messages.push({
          senderId,
          senderType,
          message,
          timestamp: new Date(),
        });
        await chat.save();

        // Emit the new message to the room
        io.to(chatId).emit("message", {
          senderId,
          senderType,
          message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error handling chatMessage:", error);
      }
    }
  );

  // Handle typing notifications
  socket.on("typing", ({ chatId, senderType, isTyping }) => {
    io.to(chatId).emit("typing", { senderType, isTyping });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});
