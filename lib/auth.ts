import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"

const authOrigin =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:3000"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: [authOrigin],
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
