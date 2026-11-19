import { Menu } from "lucide-react"
import type { ReactNode } from "react"
export function ShellHeader({ title, open, onMenuClick, children }: { title: string; open: boolean; onMenuClick: () => void; children: ReactNode }) {
    return <header className="shell-header">
        <button type="button" className="shell-control shell-menu-trigger" onClick={onMenuClick} aria-label="Abrir menú lateral" aria-controls="admin-sidebar" aria-expanded={open}><Menu size={21} /></button>
        <div className="shell-header-title"><p>LEGUMEX RMP</p><h1>{title}</h1></div>
        {children}
    </header>
}
