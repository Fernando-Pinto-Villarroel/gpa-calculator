import { redirect } from "next/navigation";

export default function LegacyBareConfigRedirect() {
  redirect("/en/grades");
}
