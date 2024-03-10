import { createCookie, createSessionStorage } from "@remix-run/node";
import crypto from "node:crypto";
import redisClient from "./redis.server";

const client = redisClient;

/**
 * The input/output to a session storage object are HTTP cookies. getSession() retrieves the current session from the incoming request's Cookie header, and commitSession()/destroySession() provide the Set-Cookie header for the outgoing response.
 */
const sessionCookie = createCookie("__session", {
  httpOnly: true,
  maxAge: 600,
  path: "/",
  sameSite: "lax",
  secrets: [process.env.SESSION_SECRET || ""], // TODO: replace this with an actual secret. Should this be generated?
  secure: process.env.NODE_ENV === "production",
});

function dateToTTL(date: Date | undefined) {
  if (!date) return 600;
  return Math.floor((date.getTime() - Date.now()) / 1000);
}

export const sessionStorage = createSessionStorage({
  cookie: sessionCookie,
  async createData(data, expires) {
    const id = crypto.randomBytes(8).toString("hex");
    await client.connect();
    await client.setEx(id, dateToTTL(expires), JSON.stringify(data));
    await client.quit();
    return id;
  },
  async readData(id) {
    await client.connect();
    const data = await client.get(id);
    await client.quit();
    if (!data) return null;
    return JSON.parse(data);
  },
  async updateData(id, data, expires) {
    await client.connect();
    await client.setEx(id, dateToTTL(expires), JSON.stringify(data));
    await client.quit();
  },
  async deleteData(id) {
    await client.connect();
    await client.del(id);
    await client.quit();
  },
});
