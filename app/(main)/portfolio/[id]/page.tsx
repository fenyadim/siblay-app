import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  getPortfolioItem,
  getPublishedPortfolioIds,
} from "@/actions/portfolio"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/validations/portfolio"

export const revalidate = 300

interface Props {
  params: Promise<{ id: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://siblay.ru"

export async function generateStaticParams() {
  try {
    const items = await getPublishedPortfolioIds()
    return items.map((i) => ({ id: i.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let item
  try {
    item = await getPortfolioItem(id)
  } catch (error) {
    console.warn('Failed to fetch portfolio item for metadata:', error)
    return {
      title: "Работа не найдена",
      robots: { index: false, follow: false },
    }
  }

  if (!item) {
    return {
      title: "Работа не найдена",
      robots: { index: false, follow: false },
    }
  }

  const category = PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category
  const description =
    item.description ??
    `${item.title} — пример работы Siblay (${category}, материал: ${item.material}).`
  const url = `/portfolio/${item.id}`
  const cover = item.images[0]

  return {
    title: item.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${item.title} — Siblay`,
      description,
      url,
      type: "article",
      images: cover ? [{ url: cover, alt: item.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { id } = await params
  let item
  try {
    item = await getPortfolioItem(id)
  } catch (error) {
    console.warn('Failed to fetch portfolio item:', error)
    notFound()
  }
  if (!item) notFound()

  const category = PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category
  const params_ =
    item.params && typeof item.params === "object" && !Array.isArray(item.params)
      ? (item.params as Record<string, string>)
      : null

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.description ?? undefined,
    image: item.images.map((img) => img),
    material: item.material,
    genre: category,
    url: `${siteUrl}/portfolio/${item.id}`,
    creator: { "@id": `${siteUrl}#organization` },
    dateCreated: item.createdAt.toISOString(),
    dateModified: item.updatedAt.toISOString(),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Портфолио",
        item: `${siteUrl}/portfolio`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: `${siteUrl}/portfolio/${item.id}`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Хлебные крошки" className="mb-6">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="size-4" />
            Все работы
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-3">
            {item.images[0] ? (
              <div className="relative aspect-square rounded-2xl border border-border bg-surface overflow-hidden">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-2xl border border-border bg-surface flex items-center justify-center">
                <span className="text-7xl opacity-10">◈</span>
              </div>
            )}

            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {item.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-square rounded-xl border border-border bg-surface overflow-hidden"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${item.title} — фото ${i + 2}`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-muted border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                {category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--accent-subtle) text-accent border border-(--accent-border)">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item.material}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4 font-display">
              {item.title}
            </h1>

            {item.description && (
              <p className="text-base text-muted leading-relaxed mb-8">
                {item.description}
              </p>
            )}

            {params_ && (
              <div className="mb-8">
                <p className="label-mono mb-3">Параметры</p>
                <dl className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
                  {Object.entries(params_).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="text-xs font-mono font-semibold text-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <Button className="rounded-full self-start" asChild size="lg">
              <Link href="/order">
                Заказать похожее
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
