import { FileText } from "lucide-react"
import { quitarTildes } from "@/shared/utils/sinTildes"

// Especificaciones de materia prima disponibles para consulta durante la evaluación.
// Para agregar otro producto: copiar el PDF en public/especificaciones y agregar su fila aquí.
const SPECIFICATIONS = [
    { keyword: "BROCOLI", code: "TAB-GC-02", file: "/especificaciones/TAB-GC-02-brocoli.pdf" },
]

function findProductSpecification(productName: string) {
    const name = quitarTildes(productName.toUpperCase())
    return SPECIFICATIONS.find(spec => name.includes(spec.keyword)) ?? null
}

export function ProductSpecificationLink({ productName }: { productName: string }) {
    const spec = findProductSpecification(productName)
    if (!spec) return null
    return (
        <a
            href={spec.file}
            target="_blank"
            rel="noopener noreferrer"
            title={`Ver especificación de materia prima (${spec.code})`}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border-[1.5px] border-border-light bg-surface px-3 text-sm font-medium text-primary-dark transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        >
            <FileText size={18} aria-hidden="true" />
            <span>Especificación <span className="hidden sm:inline">{spec.code}</span></span>
            <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
    )
}
