import { Link } from "react-router-dom"
import { ClipboardCheck, FileCheck2, FileText, History, PackageCheck, Pencil } from "lucide-react"
import { TableActions } from "@/shared/component/table.component"
import type { RmReception } from "../schema/rmReception.schema"
import { canEditStage } from "../utils/editPolicy"

export function ReceptionRowActions({ boleta, permissions, onAssignGrn, roleName }: {
    boleta: RmReception; permissions: string[]; onAssignGrn: (boleta: RmReception) => void; roleName?: string
}) {
    const exceptional = permissions.includes("rawMaterialReceptions:overrideEdit")
    const editTitle = (label: string, count: number) => `${label} (${exceptional ? `${count} correcciones registradas` : `${count}/2 correcciones utilizadas`})`
    return <TableActions>
        {canEditStage(boleta, "field", permissions, roleName) && <Link to={`/boletas/${boleta.id}/campo/editar`}
            className="btn-icon btn-icon-primary" aria-label="Editar datos de campo" title={editTitle("Editar datos de campo", boleta.fieldEditCount)}>
            <Pencil size={16} aria-hidden="true" />
        </Link>}
        {!!boleta.prodDataReceptions[0] && canEditStage(boleta, "reception", permissions) && <Link to={`/boletas/${boleta.id}/recepcion/editar`}
            className="btn-icon btn-icon-primary" aria-label="Editar recepción" title={editTitle("Editar recepción", boleta.receptionEditCount)}>
            <Pencil size={16} aria-hidden="true" />
        </Link>}
        {boleta.status !== "pendiente_recepcion" && boleta.status !== "pendiente_evaluacion_calidad" && canEditStage(boleta, "quality", permissions) && <Link to={`/boletas/${boleta.id}/calidad/editar`}
            className="btn-icon btn-icon-primary" aria-label="Editar evaluación de calidad" title={editTitle("Editar evaluación de calidad", boleta.qualityEditCount)}>
            <Pencil size={16} aria-hidden="true" />
        </Link>}
        {permissions.includes("rawMaterialReceptions:viewHistory") && <Link to={`/boletas/${boleta.id}/historial`}
            className="btn-icon btn-icon-primary" aria-label="Ver historial de correcciones" title="Ver historial de correcciones">
            <History size={16} aria-hidden="true" />
        </Link>}
        {boleta.status === "pendiente_asignacion_grn" && permissions.includes("rawMaterialReceptions:assignGrn") && <button
            type="button" onClick={() => onAssignGrn(boleta)} className="btn-icon btn-icon-primary" aria-label="Asignar GRN" title="Asignar GRN">
            <FileCheck2 size={16} aria-hidden="true" />
        </button>}
        {boleta.status === "pendiente_evaluacion_calidad" && permissions.includes("qualityEvaluations:view") && permissions.includes("qualityEvaluations:create") && <Link
            to={`/boletas/${boleta.id}/calidad`} className="btn-icon btn-icon-primary" aria-label="Evaluar calidad" title="Evaluar calidad">
            <ClipboardCheck size={16} aria-hidden="true" />
        </Link>}
        {boleta.status === "pendiente_recepcion" && permissions.includes("rawMaterialReceptions:receive") && <Link
            to={`/boletas/${boleta.id}/recepcion`} className="btn-icon btn-icon-primary" aria-label="Registrar recepción" title="Registrar recepción">
            <PackageCheck size={16} aria-hidden="true" />
        </Link>}
        <Link to={`/boletas/${boleta.id}/pdf`} className="btn-icon btn-icon-primary" aria-label="Ver documento" title="Ver documento">
            <FileText size={16} aria-hidden="true" />
        </Link>
    </TableActions>
}
