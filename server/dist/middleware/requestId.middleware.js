"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
const request_id_1 = require("../logging/request-id");
function requestIdMiddleware(req, res, next) {
    const requestId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    request_id_1.requestContext.run({ requestId }, () => {
        next();
    });
}
