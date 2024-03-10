import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { sessionStorage } from "~/services/session.server";

interface User {
  id: string;
  token: string;
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

// Tell the authenticator to use the OAuth 2.0 Strategy
authenticator.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://provider.com/oauth2/authorize",
      tokenURL: "https://provider.com/oauth2/token",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://example.app/auth/callback",
      scope: "openid email profile", // optional
      useBasicAuthenticationHeader: false, // defaults to false
    },
    async ({
      accessToken,
      refreshToken,
      extraParams,
      profile,
      context,
      request,
    }) => {
      // here you can use the params above to get the user and return it
      // what you do inside this and how you find the user is up to you
      return await getUser(
        accessToken,
        refreshToken,
        extraParams,
        profile,
        context,
        request
      );
    }
  ),
  // this is optional, but if you setup more than one OAuth2 instance you will
  // need to set a custom name to each one
  "provider-name"
);
