import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { auth } from '@/lib/auth'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
