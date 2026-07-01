import { Socket } from "socket.io";
import { ZodSchema, ZodError } from "zod";
import { createErrorResponse } from "./socket.utils";
import { ERROR_CODES } from "./socket.constants";
import { SocketAck, SocketData } from "./socket.types";

export const validatePayload = (schema: ZodSchema) => {
  return (payload: any, ack?: SocketAck) => {
    try {
      const validData = schema.parse(payload);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof ZodError) {
        if (typeof ack === "function") {
          ack(createErrorResponse(
            ERROR_CODES.INVALID_PAYLOAD,
            "Invalid event payload",
            error.errors
          ));
        }
      }
      return { success: false, data: null };
    }
  };
};

export const withErrorHandling = (
  handler: (socket: Socket<any, any, any, SocketData>, payload: any, ack?: SocketAck) => Promise<void>
) => {
  return async (socket: Socket<any, any, any, SocketData>, payload: any, ack?: SocketAck) => {
    try {
      await handler(socket, payload, ack);
    } catch (error: any) {
      if (typeof ack === "function") {
        ack(createErrorResponse(
          error.code || ERROR_CODES.INTERNAL_ERROR,
          error.message || "An unexpected error occurred."
        ));
      } else {
        socket.emit("error", {
          code: error.code || ERROR_CODES.INTERNAL_ERROR,
          message: error.message || "An unexpected error occurred.",
        });
      }
    }
  };
};
