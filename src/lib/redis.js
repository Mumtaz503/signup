import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.error("Redis Client Error", err));

//Make a connection to Redis to create a temporary storage to save user credentials until verification is complete
export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

export default client;
