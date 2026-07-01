import { StandardSocketResponse } from "./socket.types";
import { v4 as uuidv4 } from "uuid";

export const createSuccessResponse = <T>(details?: T): StandardSocketResponse<T> => {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    details,
  };
};

export const createErrorResponse = (
  code: string,
  message: string,
  details?: any
): StandardSocketResponse => {
  return {
    success: false,
    code,
    message,
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    details,
  };
};
