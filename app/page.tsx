import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to the new prompts page
  redirect("/prompts");

  // This return is never reached due to the redirect,
  // but we include it to make it clear this is a React component
  return null;
}

