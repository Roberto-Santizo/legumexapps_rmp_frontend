import { useEffect, useId, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { canViewNavigationItem, matchesNavigationPath, navigationLinks, navigationTopLinks, visibleNavigationCategories } from "@/app/navigation/navigation.config"
import type { NavigationItem } from "@/app/navigation/navigation.config"

type NavigationProps = { onNavigate?: () => void }

function NavigationLink({ item, onNavigate }: { item: NavigationItem; onNavigate?: () => void }) {
    const Icon = item.icon
    return (
        <NavLink
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
                `shell-nav-link ${isActive ? "is-active" : ""}`
            }
        >
            <Icon size={18} className="shrink-0" aria-hidden="true" />
            <span>{item.title}</span>
        </NavLink>
    )
}

export function Navigation({ onNavigate }: NavigationProps) {
    const { user } = useAuthentication()
    const { pathname } = useLocation()
    const id = useId()
    const permissions = user?.permissions ?? []
    const categories = visibleNavigationCategories(permissions, user?.role)
    const activeCategoryId = categories.find(category =>
        category.items.some(item => matchesNavigationPath(pathname, item.path))
    )?.id
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() =>
        activeCategoryId ? { [activeCategoryId]: true } : {}
    )

    useEffect(() => {
        if (activeCategoryId) {
            setOpenCategories(previous => previous[activeCategoryId]
                ? previous
                : { ...previous, [activeCategoryId]: true })
        }
    }, [pathname, activeCategoryId])

    return (
        <nav aria-label="Menú principal" className="shell-nav space-y-3">
            {navigationTopLinks.some(item => canViewNavigationItem(item, permissions)) && (
                <ul className="shell-nav-section space-y-1">
                    {navigationTopLinks.filter(item => canViewNavigationItem(item, permissions)).map(item => (
                        <li key={item.id}><NavigationLink item={item} onNavigate={onNavigate} /></li>
                    ))}
                </ul>
            )}
            {categories.map(({ id: categoryId, title, items }) => {
                const isOpen = !!openCategories[categoryId]
                const triggerId = `${id}-${categoryId}-trigger`
                const panelId = `${id}-${categoryId}-panel`
                return (
                    <section key={categoryId} className="shell-nav-section">
                        <h2>
                            <button
                                type="button"
                                id={triggerId}
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => setOpenCategories(previous => ({ ...previous, [categoryId]: !previous[categoryId] }))}
                                className="shell-nav-trigger"
                            >
                                <span>{title}</span>
                                <ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} />
                            </button>
                        </h2>
                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            aria-hidden={!isOpen}
                            inert={!isOpen}
                            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="min-h-0 overflow-hidden">
                                <ul className="space-y-1 pt-2">
                                    {items.map(item => (
                                        <li key={item.id}><NavigationLink item={item} onNavigate={onNavigate} /></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )
            })}
            <ul className="space-y-1">
                {navigationLinks.filter(item => canViewNavigationItem(item, permissions)).map(item => (
                    <li key={item.id}><NavigationLink item={item} onNavigate={onNavigate} /></li>
                ))}
            </ul>
        </nav>
    )
}
