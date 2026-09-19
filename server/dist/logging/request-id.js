"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = void 0;
exports.getRequestId = getRequestId;
exports.getContextStore = getContextStore;
// server/src/logging/request-id.ts
const async_hooks_1 = require("async_hooks");
exports.requestContext = new async_hooks_1.AsyncLocalStorage();
function getRequestId() {
    return exports.requestContext.getStore()?.requestId;
}
function getContextStore() {
    return exports.requestContext.getStore();
}
