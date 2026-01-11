import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthPage = createRouteMatcher(["/auth", "/login", "/signin"]);
const isPublicPage = createRouteMatcher(["/docs(.*)", "/api(.*)", "/dev"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isAuthPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  if (!isAuthenticated && !isAuthPage(request) && !isPublicPage(request)) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
