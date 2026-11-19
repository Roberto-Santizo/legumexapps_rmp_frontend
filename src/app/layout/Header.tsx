import { UserRound, LogOut, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect, useId } from "react"
import { useLocation } from "react-router-dom"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { useGreetingGT } from "@/shared/hook/useGreetingGT"
import { ShellHeader } from "@/shared/layout/ShellHeader"
import { navigationCategories, navigationLinks, navigationTopLinks, matchesNavigationPath } from "../navigation/navigation.config"

export function Header({ mobileMenuOpen, onMenuClick }: { mobileMenuOpen: boolean; onMenuClick: () => void }) {
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const profileButton = useRef<HTMLButtonElement>(null)
    const profileId = useId()
    const { user, logout } = useAuthentication()
    const { pathname } = useLocation()
    const greeting = useGreetingGT()
    const name = user?.name?.trim() || user?.username || "Usuario"
    const title = [...navigationTopLinks, ...navigationLinks, ...navigationCategories.flatMap(category => category.items)]
        .find(item => matchesNavigationPath(pathname, item.path))?.title ?? "Recepción de materia prima"

    useEffect(() => {
        if (!profileOpen) return
        const outside = (event: PointerEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false) }
        const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") { setProfileOpen(false); profileButton.current?.focus() } }
        document.addEventListener("pointerdown", outside)
        document.addEventListener("keydown", keyboard)
        return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", keyboard) }
    }, [profileOpen])

    return <ShellHeader title={title} open={mobileMenuOpen} onMenuClick={onMenuClick}>
        <div className="shell-account" ref={profileRef}>
            <button type="button" ref={profileButton} className="shell-account-button" aria-expanded={profileOpen} aria-controls={profileId}
                aria-label={`Cuenta actual: ${name}. Abrir opciones de cuenta`} onClick={() => setProfileOpen(value => !value)}>
                <div className="shell-account-text"><p className="shell-account-greeting">{greeting}</p><p className="shell-account-name">{name}</p></div>
                <span className="shell-account-avatar"><UserRound size={22} aria-hidden="true" /></span>
                <ChevronDown size={15} className="hidden text-text-tertiary lg:block" aria-hidden="true" />
            </button>
            {profileOpen && <div className="shell-account-dropdown" id={profileId}>
                <div><small>Sesión activa</small><p>{name}</p></div>
                <button type="button" onClick={() => { setProfileOpen(false); logout() }}><LogOut size={17} aria-hidden="true" />Cerrar sesión</button>
            </div>}
        </div>
    </ShellHeader>
}
