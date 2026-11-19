const catalogs: Record<string, string> = {
    productores: "producers", fincas: "farms", cdps: "cdps", canastas: "baskets", variedades: "products", productos: "products",
    placas: "transport", transportistas: "transport", usuarios: "users", roles: "roles",
}

export function requiredRoutePermission(path: string): string | undefined {
    if (path === "/dashboard") return "dashboard:view"
    const segments = path.split("/").filter(Boolean)
    const resource = catalogs[segments[0]]
    if (!resource) return undefined // Workflow pages enforce their own stage-specific rules.
    const action = /^(nuevo|nueva)$/.test(segments[1] ?? "") ? "create" : segments.at(-1) === "editar" ? "edit" : "view"
    return `${resource}:${action}`
}

