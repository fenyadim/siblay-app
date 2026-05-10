import { createAuthClient } from "better-auth/react"

const authBaseUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
})

export const { signIn, signOut, useSession } = authClient
