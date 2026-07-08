"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
exports.prisma = new client_1.PrismaClient({
    log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
    ],
});
exports.prisma.$on("query", (e) => {
    logger_1.logger.debug(`[Prisma DB Query] duration: ${e.duration}ms | query: ${e.query}`);
});
