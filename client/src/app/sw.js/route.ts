import { buildServiceWorkerScript } from "@/features/pwa/serviceWorkerScript";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildServiceWorkerScript(process.env.APP_BUILD_ID ?? "development"), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
