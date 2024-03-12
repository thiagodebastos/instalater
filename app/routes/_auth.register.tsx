import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { User } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import invariant from "tiny-invariant";
import { createUser, getUserByEmail } from "~/models/user.server";
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

  console.log("/register Cookie:", request.headers.get("Cookie"));

  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  let user: User | null;

  invariant(email, "Email field must not be empty");
  invariant(password, "Password field must not be empty");

  try {
    // check if user already exists
    user = await getUserByEmail(email);
    // if the user exists return with an error saying user already exists
    if (user !== null) {
      session.flash("error", "User already exists");
      return redirect("/register", {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      });
    }

    user = await createUser(email, password);
  } catch (error: unknown) {
    session.flash("error", "Invalid email/password");
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
        data: { ...session.data, userId: user.id },
      }),
    },
  });
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>();

  return (
    <form method="POST">
      <div>
        <p>Create a new account</p>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input type="email" name="email" required />
          <FormHelperText>We&apos;ll never share your email.</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type="password" name="password" required />
        </FormControl>
        {error ? <div className="error">{error}</div> : null}
        <Link to="/login">Login</Link>
        <Button type="submit">Sign Up</Button>
      </div>
    </form>
  );
}
