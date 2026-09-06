import './admin.css'

// Simple shell — auth is handled inside (protected) route group
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-panel">{children}</div>
}
