const modules: Record<string, string> = {
    dashboard: "Dashboard y reportes",
    baskets: "Canastas",
    cdps: "CDP",
    farms: "Fincas",
    producers: "Productores",
    products: "Productos",
    rawMaterialReceptions: "Recepción de materia prima",
    qualityEvaluations: "Evaluación de calidad",
    roles: "Roles",
    transport: "Transporte",
    users: "Usuarios",
}

const actions: Record<string, string> = {
    view: "Ver",
    manageCarrier: "Gestionar boletas del transportista asignado",
    create: "Crear",
    edit: "Editar",
    delete: "Eliminar",
    editField: "Corregir campo",
    receive: "Registrar recepción",
    editReception: "Corregir recepción",
    assignGrn: "Asignar GRN",
    overrideEdit: "Editar sin límite de etapa o cantidad",
    viewHistory: "Consultar historial de correcciones",
    downloadDocuments: "Descargar boletas por fechas y productor",
}

const actionOrder = ["view", "manageCarrier", "create", "receive", "edit", "editField", "editReception", "assignGrn", "viewHistory", "downloadDocuments", "overrideEdit", "delete"]

const workflowLabels: Record<string, { label: string; description: string }> = {
    "rawMaterialReceptions:downloadDocuments": { label: "Descargar boletas por fechas y productor", description: "Abrir el apartado de descarga, filtrar por fechas y productor, y descargar boletas amarillas y evaluaciones de calidad, individuales o en ZIP. Respeta el alcance de consulta del usuario. Debe asignarse expresamente a cada rol." },
    "rawMaterialReceptions:manageCarrier": { label: "Gestionar boletas del transportista asignado", description: "Permite al representante del rol Campo consultar las boletas y PDF de todos los usuarios de su transportista, y corregirlas según los permisos del apartado, sus etapas y límites. Requiere asignar el transportista en Usuarios. No permite acceder a otros transportistas." },
    "dashboard:view": { label: "Ver dashboard y descargar reportes", description: "Acceder al dashboard y exportar el reporte de boletas cerradas. Ver boletas no concede este acceso." },
    "rawMaterialReceptions:editField": { label: "Corregir datos de campo", description: "Hasta dos correcciones por boleta, antes de registrar la recepción en planta." },
    "rawMaterialReceptions:receive": { label: "Registrar recepción en planta", description: "Completar la recepción de una boleta pendiente. No permite asignar el GRN." },
    "rawMaterialReceptions:editReception": { label: "Corregir recepción en planta", description: "Hasta dos correcciones por boleta, antes de guardar la evaluación de calidad." },
    "rawMaterialReceptions:assignGrn": { label: "Asignar GRN y cerrar boleta", description: "Asignar el GRN una sola vez, después de evaluar calidad. No permite cambiar un GRN asignado." },
    "rawMaterialReceptions:overrideEdit": { label: "Edición excepcional de boletas", description: "Corregir los tres apartados sin límite de cantidad ni etapa, incluso después del cierre. No permite cambiar el GRN ni administrar usuarios o roles." },
    "rawMaterialReceptions:viewHistory": { label: "Consultar historial de correcciones", description: "Consultar quién corrigió cada apartado, el motivo y los valores anteriores y nuevos." },
    "qualityEvaluations:edit": { label: "Corregir evaluación de calidad", description: "Hasta dos correcciones por boleta, antes de asignar el GRN, usando las tolerancias originales." },
}

function canonicalPermissionKey(name: string) {
    const [resource, action, extra] = name.trim().split(":")
    const key = Object.keys(modules).find(key => key.toLowerCase() === resource.toLowerCase())
    const normalizedAction = Object.keys(actions).find(key => key.toLowerCase() === action?.toLowerCase())
    return key && normalizedAction && extra === undefined ? `${key}:${normalizedAction}` : name
}

export function presentPermission(name: string) {
    const canonical = canonicalPermissionKey(name)
    const [resource, action] = canonical.split(":")
    const workflow = workflowLabels[canonical]
    const isKnown = !!modules[resource] && !!actions[action]
    const module = modules[resource] ?? "Otros permisos"
    const actionLabel = actions[action] ?? name
    return {
        module,
        action: actionLabel,
        label: workflow?.label ?? (isKnown ? `${actionLabel} ${module.toLocaleLowerCase("es")}` : name),
        description: workflow?.description ?? (isKnown ? `Permite ${actionLabel.toLocaleLowerCase("es")} registros de ${module.toLocaleLowerCase("es")}.` : "Permiso no reconocido"),
        order: isKnown ? actionOrder.indexOf(action) : actionOrder.length,
    }
}

export function comparePermissions(a: { name: string }, b: { name: string }) {
    const left = presentPermission(a.name)
    const right = presentPermission(b.name)
    return left.module.localeCompare(right.module, "es") || left.order - right.order || a.name.localeCompare(b.name, "es")
}

