import { useState, useCallback, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Header } from "@/app/layout/Header"
import { Sidebar } from "@/app/layout/Sidebar"

export function AppLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { pathname } = useLocation()
    const closeMenu = useCallback(() => setMobileMenuOpen(false), [])
    useEffect(closeMenu, [pathname, closeMenu])
    const isBoletaList = pathname === "/boletas" || pathname === "/boletas/"

    return (
        <div className="min-h-screen bg-bg-primary">
            <div inert={mobileMenuOpen}><Header mobileMenuOpen={mobileMenuOpen} onMenuClick={() => setMobileMenuOpen(true)} /></div>

            <Sidebar mobileMenuOpen={mobileMenuOpen} onClose={closeMenu} />

            <main inert={mobileMenuOpen} className="pt-24 pb-12 sm:pt-28 lg:pl-64">
                <div className={`mx-auto w-full ${isBoletaList ? "max-w-none px-3 sm:px-5 lg:px-6" : "max-w-[1600px] px-4 sm:px-8 lg:px-10"}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
