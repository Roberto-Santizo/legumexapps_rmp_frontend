import { useParams, Link, Navigate } from "react-router-dom"
import { formatDecimal } from "@/shared/utils/formatDecimal"
import { formatGuatemalaDate, formatGuatemalaDateTime } from "@/shared/utils/guatemalaDate"
import { useQuery } from "@tanstack/react-query"
import { History } from "lucide-react"
import { z } from "zod"
import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { Card } from "@/shared/component/card.component"
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/shared/component/table.component"

const historySchema = z.object({ data: z.array(z.object({ id: z.number(), actorName: z.string(), stage: z.enum(["field", "reception", "quality"]),
    reason: z.string(), override: z.boolean(), created_at: z.string(), before: z.record(z.string(), z.unknown()), after: z.record(z.string(), z.unknown()) })) })

const stages = { field: "Campo", reception: "Recepción", quality: "Calidad" }
const labels: Record<string, string> = {
    plantId: "Planta de recepción",
    pestEvaluation: "Gusanos y áfidos", qualityReasons: "Motivos de consignación", consignment: "Consignación",
    rule: "Criterio", version: "Versión", minBaskets: "Canastas desde", maxBaskets: "Canastas hasta", samplePounds: "Muestra (lb)",
    wormCount: "Gusanos encontrados", aphidHeadsCount: "Cabezas con áfidos", sampleConfirmed: "Muestra confirmada", reasons: "Motivos",
    wormRejectionCount: "Límite de gusanos", aphidRejectionCount: "Límite de cabezas con áfidos",
    receipt: "Boleta", field: "Campo", reception: "Recepción", quality: "Calidad", defects: "Defectos",
    fincaId: "Finca", docDate: "Fecha", productId: "Producto", producerId: "Productor", carrierId: "Transportista", plateId: "Placa",
    cdpId: "CDP", inspectorName: "Inspector", pilotName: "Piloto", basketId: "Canasta", totalBaskets: "Cantidad de canastas",
    weight: "Peso bruto", grossWeight: "Peso bruto", netWeight: "Peso neto", weightBaskets: "Tara", validPounds: "Libras pagables",
    qualityPercentage: "% calidad", qualityDefinedInPlant: "% definido en planta", percentage: "% calidad",
    harvestDocNumber: "Hoja de cosechero", sampleUnits: "Unidades de muestra", observations: "Observaciones",
    inspectorSignature: "Firma inspector", driverSignature: "Firma piloto", prodSignature: "Firma productor", receptorSignature: "Firma receptor",
    receptorName: "Receptor", evaluatorName: "Evaluador", input: "% observado", result: "Resultado", tolerancePercentage: "Tolerancia", defectName: "Defecto",
}
const hidden = new Set(["fieldEditCount", "receptionEditCount", "qualityEditCount", "editVersion"])
const decimalFields = new Set(["weight", "grossWeight", "netWeight", "weightBaskets", "validPounds", "qualityPercentage", "percentage", "input", "result", "tolerancePercentage", "acceptedPercentage", "ph", "brix"])
function displayValue(key: string, value: string | undefined) {
    if (key.split(".").at(-1) === "docDate" && value && value !== "—") return formatGuatemalaDate(value)
    if (key.endsWith("pestEvaluation.result") && value) return ({ accepted: "Aceptado", correction_required: "Necesita corrección / límite", out_of_tolerance: "Fuera de tolerancia / consignado" } as Record<string, string>)[value] ?? value
    return decimalFields.has(key.split(".").at(-1) ?? "") && value !== undefined && /^-?\d+(\.\d+)?$/.test(value)
        ? formatDecimal(Number(value)) : value ?? "—"
}
function flatten(value: unknown, path = "", output: Record<string, string> = {}) {
    if (value !== null && typeof value === "object") {
        for (const [key, entry] of Object.entries(value)) if (!hidden.has(key)) flatten(entry, path ? `${path}.${key}` : key, output)
    } else output[path] = value === null || value === undefined ? "—" : typeof value === "boolean" ? (value ? "Sí" : "No") : String(value)
    return output
}

export function ReceptionHistory() {
    const { id } = useParams()
    const { user } = useAuthentication()
    const allowed = !!user?.permissions.includes("rawMaterialReceptions:viewHistory")
    const query = useQuery({ queryKey: ["reception-history", id], enabled: allowed, queryFn: async () => {
        try { return historySchema.parse((await api.get(`/rm-receptions/${id}/history`)).data) }
        catch (error) { manejarErrorApi(error) }
    } })
    if (!allowed) return <Navigate to="/403" replace />
    if (query.isLoading) return <LoadingSpinner />
    return <PageContainer size="wide">
        <PageHeader icon={History} title="Historial de correcciones" description={`Boleta #${id?.padStart(6, "0")}`} />
        <Link to="/boletas" className="mb-5 inline-block text-primary-dark underline">Volver a boletas</Link>
        {query.isError && <p role="alert" className="text-error-fg">{query.error.message}</p>}
        {!query.isError && !query.data?.data.length && <p>No hay correcciones registradas.</p>}
        <div className="space-y-4">{query.data?.data.map(edit => {
            const before = flatten(edit.before), after = flatten(edit.after)
            const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(key => before[key] !== after[key])
            return <Card key={edit.id}>
                <h2 className="font-semibold">{stages[edit.stage]} · {edit.actorName}{edit.override ? " · Edición excepcional" : ""}</h2>
                <p className="my-2 text-sm text-text-tertiary">{formatGuatemalaDateTime(edit.created_at)}</p>
                <p className="whitespace-pre-wrap break-words">{edit.reason}</p>
                <details className="mt-3"><summary className="cursor-pointer text-primary-dark">Ver cambios ({changed.length})</summary>
                    <Table><TableHead><TableRow><Th>Dato</Th><Th>Antes</Th><Th>Después</Th></TableRow></TableHead>
                        <TableBody>{changed.map(key => <TableRow key={key}><Td>{key.split(".").map(part => labels[part] ?? part).join(" / ")}</Td>
                            <Td className="max-w-sm break-all">{displayValue(key, before[key])}</Td><Td className="max-w-sm break-all">{displayValue(key, after[key])}</Td></TableRow>)}</TableBody>
                    </Table>
                </details>
            </Card>
        })}</div>
    </PageContainer>
}
