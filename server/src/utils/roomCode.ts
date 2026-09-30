import { prisma } from "@/config/prisma";

/**
 * Generates a random uppercase alphanumeric room code of length 6.
 */
export async function generateRoomCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let isUnique = false;
  let code = "";

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Verify uniqueness in database
    const existing = await prisma.room.findUnique({
      where: { roomCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}
