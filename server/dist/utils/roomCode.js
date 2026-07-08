"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
const prisma_1 = require("@/config/prisma");
/**
 * Generates a random uppercase alphanumeric room code of length 6.
 */
async function generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let isUnique = false;
    let code = "";
    while (!isUnique) {
        code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Verify uniqueness in database
        const existing = await prisma_1.prisma.room.findUnique({
            where: { roomCode: code },
        });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
}
