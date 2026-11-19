import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"

export function ShellSidebar({ open, onClose, brand, children }: { open: boolean; onClose: () => void; brand: ReactNode; children: ReactNode }) {
    const drawer = useRef<HTMLElement>(null)
    useEffect(() => {
        if (!open) return
        const desktop = window.matchMedia("(min-width: 1024px)")
        if (desktop.matches) { onClose(); return }
        const previousFocus = document.activeElement as HTMLElement | null
        const overflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        drawer.current?.querySelector<HTMLButtonElement>("button")?.focus()
        const resize = () => { if (desktop.matches) onClose() }
        const keyboard = (event: KeyboardEvent) => {
            if (event.key === "Escape") { event.preventDefault(); onClose() }
            if (event.key !== "Tab") return
            const controls = Array.from(drawer.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]') ?? [])
                .filter(element => element.getClientRects().length > 0 && !element.closest("[inert]"))
            const first = controls[0], last = controls[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }
        desktop.addEventListener("change", resize)
        document.addEventListener("keydown", keyboard)
        return () => {
            document.body.style.overflow = overflow
            desktop.removeEventListener("change", resize)
            document.removeEventListener("keydown", keyboard)
            previousFocus?.focus()
        }
    }, [open, onClose])
    return <>
        {open && <button type="button" aria-label="Cerrar menú lateral" className="shell-backdrop" onClick={onClose} />}
        <aside ref={drawer} id="admin-sidebar" role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label="Navegación lateral" className={`shell-sidebar ${open ? "is-open" : ""}`}>
            <div className="shell-sidebar-brand">{brand}<button type="button" className="shell-control shell-sidebar-close" onClick={onClose} aria-label="Cerrar menú lateral"><X size={18} /></button></div>
            <div className="shell-sidebar-scroll">{children}</div>
            <div className="shell-sidebar-footer"><span className="shell-brand-dot" />Legumex RMP<span>Recepción de materia prima</span></div>
        </aside>
    </>
}
