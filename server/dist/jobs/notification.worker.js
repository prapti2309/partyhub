"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationWorker = startNotificationWorker;
const logger_1 = require("@/utils/logger");
function startNotificationWorker() {
    logger_1.logger.info("🔔 Mock Notification Worker initialized and waiting for jobs");
}
