import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

/**
 * The input/output to a session storage object are HTTP cookies. getSession() retrieves the current session from the incoming request's Cookie header, and commitSession()/destroySession() provide the Set-Cookie header for the outgoing response.
 */
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    // a Cookie from `createCookie` or the CookieOptions to create one
    {
      cookie: {
        name: "__session",
        httpOnly: true,
        maxAge: 600,
        path: "/",
        sameSite: "lax",
        secrets: ["secret"],
        // secure: true,
      },
    }
  );

export { getSession, commitSession, destroySession };
