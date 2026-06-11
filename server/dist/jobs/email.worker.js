"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailWorker = startEmailWorker;
const logger_1 = require("../utils/logger");
function startEmailWorker() {
    logger_1.logger.info("📧 Mock Email Worker initialized and waiting for jobs");
}
