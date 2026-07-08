import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient } from "@/config/redis";

export const getRedisAdapter = () => {
  const pubClient = redisClient;
  if (!pubClient) {
    throw new Error("Redis client not initialized for socket adapter");
  }
  const subClient = pubClient.duplicate();
  
  // We need to connect the subClient if it's not already connected
  // Depending on the redis library used (redis v4), duplicate() creates an unconnected client
  subClient.connect().catch(console.error);

  return createAdapter(pubClient, subClient);
};
