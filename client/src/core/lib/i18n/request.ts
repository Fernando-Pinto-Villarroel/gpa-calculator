import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../../../../messages/en.json";
import es from "../../../../messages/es.json";
import pt from "../../../../messages/pt.json";

const messagesMap = { en, es, pt };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "es" | "pt")) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    timeZone: "UTC",
    messages: messagesMap[locale as "en" | "es" | "pt"],
  };
});
