import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { siteUrl } from "@/lib/seo"

const publicSite = new URL(siteUrl || "https://siblay.ru")
// Coolify terminates TLS before forwarding requests to the HTTP container.
if (process.env.NODE_ENV === "production" && publicSite.protocol === "http:") {
  publicSite.protocol = "https:"
}
const authBaseUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  (process.env.NODE_ENV === "production" ? publicSite.origin : "http://localhost:3000")

export const auth = betterAuth({
  baseURL: authBaseUrl,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: [new URL(authBaseUrl).origin, publicSite.origin],
  rateLimit: {
    // Built-in limiter only runs in production by default; force-enable so
    // brute-force attempts against the single admin login are throttled
    // everywhere (including staging).
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      // Tight bucket on the password endpoint — 5 attempts per 5 minutes is
      // enough for a forgetful admin but expensive for an attacker.
      "/sign-in/email": { window: 300, max: 5 },
    },
  },
})

export type Session = typeof auth.$Infer.Session
