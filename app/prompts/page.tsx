import { redirect } from "next/navigation"

export default function PromptsPage() {
  // Redirect to the home page which already handles prompts listing
  redirect("/")

  // This return is never reached due to the redirect,
  // but we include it to make it clear this is a React component
  return null
}

