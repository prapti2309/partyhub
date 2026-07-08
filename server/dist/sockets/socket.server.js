"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketIO = getSocketIO;
exports.initSocketServer = initSocketServer;
const socket_io_1 = require("socket.io");
const logger_1 = require("@/utils/logger");
const socket_adapter_1 = require("./socket.adapter");
const socket_authentication_1 = require("./socket.authentication");
// Import Handlers
const room_handler_1 = require("./handlers/room.handler");
const player_handler_1 = require("./handlers/player.handler");
const chat_handler_1 = require("./handlers/chat.handler");
const presence_handler_1 = require("./handlers/presence.handler");
const voice_handler_1 = require("./handlers/voice.handler");
const media_handler_1 = require("./handlers/media.handler");
let ioInstance = null;
function getSocketIO() {
    if (!ioInstance) {
        throw new Error("Socket.IO has not been initialized");
    }
    return ioInstance;
}
function initSocketServer(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        adapter: (0, socket_adapter_1.getRedisAdapter)(),
        pingInterval: 10000,
        pingTimeout: 5000,
    });
    ioInstance = io;
    // Socket connection authorization handshake middleware
    io.use(socket_authentication_1.socketAuthenticationMiddleware);
    io.on("connection", (socket) => {
        logger_1.logger.info(`🔌 [Socket.IO] New client connected: ${socket.id} (user: ${socket.data.user?.id})`);
        // Register Handlers
        (0, room_handler_1.registerRoomHandlers)(io, socket);
        (0, player_handler_1.registerPlayerHandlers)(io, socket);
        (0, chat_handler_1.registerChatHandlers)(io, socket);
        (0, presence_handler_1.registerPresenceHandlers)(io, socket);
        (0, voice_handler_1.registerVoiceHandlers)(io, socket);
        (0, media_handler_1.registerMediaHandlers)(io, socket);
        socket.on("disconnect", (reason) => {
            logger_1.logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id} (user: ${socket.data.user?.id}), Reason: ${reason}`);
            // Actual cleanup is done inside presence/room handlers listening to disconnect
        });
    });
    return io;
}
