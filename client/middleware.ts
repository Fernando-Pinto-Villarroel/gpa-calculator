import createMiddleware from "next-intl/middleware";
import { routing } from "./src/core/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
