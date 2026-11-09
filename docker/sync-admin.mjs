import { randomUUID } from "node:crypto"
import { hashPassword, verifyPassword } from "better-auth/crypto"
import pg from "pg"

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (password) {
  if (!email || email !== email.trim().toLowerCase() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to the lowercase admin email address.")
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD must contain 8 to 128 characters.")
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.")

  const db = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()
  try {
    await db.query("BEGIN")
    // Serialize concurrent starts for this email, including first-time creation.
    await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [email])
    let { rows: [user] } = await db.query('SELECT id FROM "User" WHERE email = $1', [email])
    if (!user) {
      user = { id: randomUUID() }
      await db.query(
        `INSERT INTO "User" (id, name, email, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, 'Admin', $2, false, NOW(), NOW())`,
        [user.id, email],
      )
    }

    const { rows: [account] } = await db.query(
      `SELECT id, password FROM "Account" WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [user.id],
    )
    if (!account?.password || !(await verifyPassword({ hash: account.password, password }))) {
      const hash = await hashPassword(password)
      if (account) {
        await db.query('UPDATE "Account" SET password = $1, "updatedAt" = NOW() WHERE id = $2', [hash, account.id])
      } else {
        await db.query(
          `INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
           VALUES ($1, $2, $2, 'credential', $3, NOW(), NOW())`,
          [randomUUID(), user.id, hash],
        )
      }
      await db.query('DELETE FROM "Session" WHERE "userId" = $1', [user.id])
    }
    await db.query("COMMIT")
    console.log("[entrypoint] Admin credentials ready.")
  } catch (error) {
    await db.query("ROLLBACK")
    throw error
  } finally {
    await db.end()
  }
}
