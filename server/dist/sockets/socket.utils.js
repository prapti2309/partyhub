"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = void 0;
const uuid_1 = require("uuid");
const createSuccessResponse = (details) => {
    return {
        success: true,
        timestamp: new Date().toISOString(),
        requestId: (0, uuid_1.v4)(),
        details,
    };
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (code, message, details) => {
    return {
        success: false,
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId: (0, uuid_1.v4)(),
        details,
    };
};
exports.createErrorResponse = createErrorResponse;
