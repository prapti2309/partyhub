"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
function initSocketServer(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        logger_1.logger.info(`🔌 [Socket.IO] New client connection established: ${socket.id}`);
        socket.on("disconnect", () => {
            logger_1.logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
        });
    });
    return io;
}
