import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";

const PasswordWithName = Password({
  profile(params) {
    const profile: { email: string; name?: string } = {
      email: params.email as string,
    };
    if (typeof params.name === "string" && params.name.length > 0) {
      profile.name = params.name;
    }
    return profile;
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [PasswordWithName, GitHub, Google],
});
