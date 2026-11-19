import { ClipboardList, Package, Tag, PackageOpen, Truck, CarFront, FileCheck2, Users, Shield, LifeBuoy, LayoutDashboard, Sprout, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavigationItem = {
    id: string
    title: string
    path: string
    icon: LucideIcon
    permissions: readonly string[]
}

export type NavigationCategory = {
    id: string
    title: string
    items: NavigationItem[]
}

export const navigationCategories: NavigationCategory[] = [
    {
        id: "operations", title: "Operaciones",
        items: [
            { id: "receptions", title: "Boleta de materia prima", path: "/boletas", icon: ClipboardList, permissions: ["rawMaterialReceptions:view"] },
        ],
    },
    {
        id: "catalogs", title: "Catálogos",
        items: [
            { id: "farms", title: "Fincas", path: "/fincas", icon: Sprout, permissions: ["farms:view"] },
            { id: "producers", title: "Productores", path: "/productores", icon: UserRound, permissions: ["producers:view"] },
            { id: "products", title: "Productos", path: "/productos", icon: Package, permissions: ["products:view"] },
            { id: "varieties", title: "Variedades", path: "/variedades", icon: Tag, permissions: ["products:view"] },
            { id: "baskets", title: "Canastas", path: "/canastas", icon: PackageOpen, permissions: ["baskets:view"] },
            { id: "carriers", title: "Transportistas", path: "/transportistas", icon: Truck, permissions: ["transport:view"] },
            { id: "plates", title: "Placas", path: "/placas", icon: CarFront, permissions: ["transport:view"] },
            { id: "cdps", title: "CDP", path: "/cdps", icon: FileCheck2, permissions: ["cdps:view"] },
        ],
    },
    {
        id: "administration", title: "Administración",
        items: [
            { id: "users", title: "Usuarios", path: "/usuarios", icon: Users, permissions: ["users:view"] },
            { id: "roles", title: "Roles", path: "/roles", icon: Shield, permissions: ["roles:view"] },
        ],
    },
]

export const navigationLinks: NavigationItem[] = [
    { id: "help", title: "Ayuda", path: "/ayuda", icon: LifeBuoy, permissions: [] },
]

export const navigationTopLinks: NavigationItem[] = [
    { id: "dashboard", title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permissions: ["dashboard:view"] },
]

const fieldHiddenItems = new Set(["farms", "producers", "products", "varieties", "baskets", "carriers", "plates", "cdps"])

export function canViewNavigationItem(item: NavigationItem, permissions: readonly string[], role?: string) {
    if (role?.trim().toLocaleLowerCase("es") === "campo" && fieldHiddenItems.has(item.id)) return false
    return item.permissions.every(permission => permissions.includes(permission))
}

export function visibleNavigationCategories(permissions: readonly string[], role?: string) {
    return navigationCategories
        .map(category => ({ ...category, items: category.items.filter(item => canViewNavigationItem(item, permissions, role)) }))
        .filter(category => category.items.length > 0)
}

export function matchesNavigationPath(pathname: string, path: string) {
    return pathname === path || pathname.startsWith(`${path}/`)
}
