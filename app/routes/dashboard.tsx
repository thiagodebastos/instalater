import { Button } from "@chakra-ui/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { sessionStorage } from "~/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  // No userId means there is no logged in user session
  if (!session.has("userId"))
    return redirect("/login", {
      headers: {
        /* NOTE:
         * it is good practice to destroy any sessions that may be lingering around
         * when a user is not logged in. For example if the user leaves their browser open
         * in this route for too long and the session expires.
         * Security: This prevents session hijacking and unauthorized access.
         * State Management: Ensure consistency between client and server
         * By destroying the session here before the redirect, we ensure that the user lands
         * back on the login page without any residual session data
         */
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });

  return {
    user: session.get("userId"),
  };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  await sessionStorage.destroySession(session);

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
};

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as: {user.email}</p>
      <Form method="post">
        <Button type="submit">Log out</Button>
      </Form>
    </div>
  );
}
