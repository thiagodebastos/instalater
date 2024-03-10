import {
  Button,
  Center,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
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

// TODO: create validateCredentials handler
function validateCredentials(
  username: FormDataEntryValue | null,
  password: FormDataEntryValue | null
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (username === "admin" && password === "password") {
      resolve("admin");
    } else {
      reject(new Error("Invalid Credentials"));
    }
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  console.log(request.headers.get("Cookie"));

  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  let userId: string | null;

  try {
    userId = await validateCredentials(username, password);
    if (userId == null) {
      session.flash("error", "Invalid username/password");
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      });
    }
  } catch (error: unknown) {
    session.flash("error", "Invalid username/password");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }

  return redirect("/publish", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession({
        ...session,
        data: { ...session.data, userId },
      }),
    },
  });
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>();
  // const routerError = useRouteError();

  return (
    <Center h="100vh">
      <form method="POST">
        <div>
          <p>Please sign in</p>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" name="username" />
            <FormHelperText>We&apos;ll never share your email.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" />
          </FormControl>
          {error ? <div className="error">{error}</div> : null}
          <Button type="submit">Login</Button>
        </div>
      </form>
    </Center>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
