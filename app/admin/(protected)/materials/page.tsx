import { getMaterialsWithColors } from "@/actions/materials"
import { MaterialsAdminClient } from "@/components/admin/MaterialsAdminClient"

export default async function AdminMaterialsPage() {
  const materials = await getMaterialsWithColors()

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-3xl font-black text-[var(--foreground)]"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Материалы
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Управляйте доступностью материалов и цветов для заказов
        </p>
      </div>

      <MaterialsAdminClient materials={materials} />
    </div>
  )
}
