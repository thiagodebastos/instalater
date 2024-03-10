import { createClient } from "redis";

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

client.on("error", (err) => console.log("Redis client error", err));

// If you update the data type, update the key version so you are not left with invalid states
// const KEY_VERSION = "1";

// export const saveToRedis = async (data: CustomFormData) => {
//   await client.connect();
//   await client.set(`f-${KEY_VERSION}-${data.id}`, JSON.stringify(data));
//   await client.quit();
// };

export default client;
