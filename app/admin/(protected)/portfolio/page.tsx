import { prisma } from "@/lib/prisma"
import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/validations/portfolio"
import { PortfolioAdminClient } from "@/components/admin/PortfolioAdminClient"

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolioItem.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-black text-foreground"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Портфолио
        </h1>
      </div>

      <PortfolioAdminClient
        items={items.map((item) => ({
          ...item,
          description: item.description ?? undefined,
          params: item.params as Record<string, string> | undefined,
        }))}
        categoryLabels={PORTFOLIO_CATEGORY_LABELS}
      />
    </div>
  )
}
