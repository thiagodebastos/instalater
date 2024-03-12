import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { User } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import invariant from "tiny-invariant";
import { verifyLogin } from "~/models/user.server";
import { sessionStorage } from "~/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  console.log(JSON.stringify(session, null, 2));

  if (session.has("userId")) {
    return redirect("/dashboard");
  }

  const data = { error: session.get("error") };

  return json(data);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  invariant(email, "Email field must not be empty");
  invariant(password, "Password field must not be empty");

  let user: User | false;

  try {
    user = await verifyLogin(email, password);

    if (!user) {
      session.flash("error", "User doesn't exist");
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      });
    }
  } catch (error: unknown) {
    session.flash("error", JSON.stringify(error));
    return redirect("/login", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession({
        ...session,
        data: { ...session.data, userId: user },
      }),
    },
  });
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>();
  // const routerError = useRouteError();

  return (
    <form method="POST">
      <div>
        <p>Please sign in</p>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input type="email" name="email" required />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type="password" name="password" required />
        </FormControl>
        {error ? <div className="error">{error}</div> : null}
        <Button type="submit">Login</Button>
        <Link to="/register">Sign Up</Link>
      </div>
    </form>
  );
}
