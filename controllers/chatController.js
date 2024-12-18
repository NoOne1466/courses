const Chat = require("../models/chatModel");
const AppError = require("../utils/appError");

exports.getChat = async (req, res, next) => {
  if (req.userModel === "User") {
    userId = req.user.id;
    instructorId = req.body.instructorId;
  } else if (req.userModel === "Instructor") {
    instructorId = req.user.id;
    userId = req.body.userId;
  } else {
    return next(new AppError("Provide a user id and doctor id", 400));
  }

  console.log(req.userModel);
  const chat = await Chat.findOne({
    user: userId,
    instructor: instructorId,
  });

  if (!chat) {
    return next(new AppError("There's no chat for the provided IDs", 404));
  }

  res.status(200).json({ status: "success", data: { chat } });
};

exports.createChat = async (req, res, next) => {
  try {
    // const { userId, instructorId } = req.body;
    console.log(req.userModel);
    if (req.userModel === "User") {
      userId = req.user.id;
      instructorId = req.body.instructorId;
    } else if (req.userModel === "Instructor") {
      instructorId = req.user.id;
      userId = req.body.userId;
    }
    console.log(instructorId, userId);

    let chat = await Chat.findOne({ user: userId, instructor: instructorId });
    if (!chat) {
      chat = new Chat({
        user: userId,
        instructor: instructorId,
        messages: [],
        createdAt: new Date(),
        typing: false,
      });
      await chat.save();
      return res.status(201).json({ success: true, chat });
    }
    return res.status(200).json({ success: true, chat });
  } catch (error) {
    // return next(new AppError("Unable to create or find the chat", 500));
    return next(new AppError(error.message, 500));
  }
};

exports.getAllChatForCurLoggedIn = async (req, res, next) => {
  let chat;
  // console.log(req.user.id);
  if (req.userModel === "User") {
    chat = await Chat.find({
      user: req.user.id,
    });
    console.log(chat);
  } else if (req.userModel === "Instructor") {
    chat = await Chat.find({
      instructor: req.instructor.id,
    });
    console.log(chat);
  }

  // console.log(chat);
  if (!chat) {
    return next(
      new AppError("There are no chats for the current logged in person.", 400)
    );
  }

  res.status(200).json({ status: "success", data: { chat } });
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, senderId, senderType, message } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    chat.messages.push({
      senderId,
      senderType,
      message,
      timestamp: new Date(),
      sent: true,
    });

    await chat.save();
    return res.status(200).json({ success: true, chat });
  } catch (error) {
    return next(new AppError("Unable to send the message", 500));
  }
};

exports.updateTypingStatus = async (req, res, next) => {
  try {
    const { chatId, typing } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    chat.typing = typing;
    await chat.save();

    return res.status(200).json({ success: true, typing });
  } catch (error) {
    return next(new AppError("Unable to update typing status", 500));
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).populate("user instructor");
    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    return next(new AppError("Unable to retrieve chat history", 500));
  }
};
