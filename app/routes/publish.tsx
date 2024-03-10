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
        // NOTE: is this necessary?
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });

  return {
    userId: session.get("userId"),
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
  const { userId } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Publish Route</h1>
      <p>Logged in as: {userId}</p>
      <Form method="post">
        <Button type="submit">Log out</Button>
      </Form>
    </div>
  );
}
