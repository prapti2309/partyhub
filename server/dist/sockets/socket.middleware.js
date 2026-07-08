"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorHandling = exports.validatePayload = void 0;
const zod_1 = require("zod");
const socket_utils_1 = require("./socket.utils");
const socket_constants_1 = require("./socket.constants");
const validatePayload = (schema) => {
    return (payload, ack) => {
        try {
            const validData = schema.parse(payload);
            return { success: true, data: validData };
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                if (typeof ack === "function") {
                    ack((0, socket_utils_1.createErrorResponse)(socket_constants_1.ERROR_CODES.INVALID_PAYLOAD, "Invalid event payload", error.errors));
                }
            }
            return { success: false, data: null };
        }
    };
};
exports.validatePayload = validatePayload;
const withErrorHandling = (handler) => {
    return async (socket, payload, ack) => {
        try {
            await handler(socket, payload, ack);
        }
        catch (error) {
            if (typeof ack === "function") {
                ack((0, socket_utils_1.createErrorResponse)(error.code || socket_constants_1.ERROR_CODES.INTERNAL_ERROR, error.message || "An unexpected error occurred."));
            }
            else {
                socket.emit("error", {
                    code: error.code || socket_constants_1.ERROR_CODES.INTERNAL_ERROR,
                    message: error.message || "An unexpected error occurred.",
                });
            }
        }
    };
};
exports.withErrorHandling = withErrorHandling;
