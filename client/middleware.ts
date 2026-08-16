import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/core/lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const LEGACY_CONFIG_PATH_RE = /^(\/(?:en|es|pt))?\/config(\/.*)?$/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(LEGACY_CONFIG_PATH_RE);

  if (match) {
    const [, localePrefix = "", rest = ""] = match;
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/grades${rest}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
