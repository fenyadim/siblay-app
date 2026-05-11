import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../app/generated/prisma/client"
import { generateBlurDataURL } from "../lib/blur"

/**
 * One-shot script: walk PortfolioItem rows and compute a blurDataURL for
 * each image that doesn't yet have one. Safe to re-run — only fills gaps.
 *
 * Usage: pnpm tsx prisma/backfill-blurs.ts  (or rerun via the same script
 * runner as seed.ts: `pnpm exec ts-node --esm prisma/backfill-blurs.ts`).
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function fetchBlur(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  ! ${url} → ${res.status}`)
      return ""
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const blur = await generateBlurDataURL(buffer)
    return blur ?? ""
  } catch (err) {
    console.warn(`  ! ${url} → ${err instanceof Error ? err.message : err}`)
    return ""
  }
}

async function main() {
  const items = await prisma.portfolioItem.findMany({
    select: { id: true, title: true, images: true, imageBlurs: true },
  })

  let updated = 0
  for (const item of items) {
    const next = [...item.imageBlurs]
    while (next.length < item.images.length) next.push("")

    let dirty = false
    for (let i = 0; i < item.images.length; i++) {
      if (next[i]) continue
      console.log(`→ ${item.title} [${i + 1}/${item.images.length}]`)
      next[i] = await fetchBlur(item.images[i])
      dirty = true
    }

    if (dirty) {
      await prisma.portfolioItem.update({
        where: { id: item.id },
        data: { imageBlurs: next },
      })
      updated++
    }
  }

  console.log(`\n✅ Done. Updated ${updated} of ${items.length} items.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
