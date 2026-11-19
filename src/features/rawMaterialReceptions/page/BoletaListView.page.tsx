import { PageContainer } from "@/shared/component/pageContainer.component"
import { AssignGrnModal } from "../component/AssignGrnModal"
import { ReceptionRowActions } from "../component/ReceptionRowActions"
import { ReceiptDownloads } from "../component/ReceiptDownloads"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { useEffect, useId, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X, ChevronDown } from "lucide-react"
import { listRmReceptionsApi } from "@/features/rawMaterialReceptions/api/rmReception.api"
import { ESTADOS_BOLETA, ESTADO_BOLETA_LABEL } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import type { RmReception } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import { Badge } from "@/shared/component/badge.component"
import { receiptActionPermissions } from "../utils/editPolicy"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { Input } from "@/shared/component/input.component"
import { DateInput } from "@/shared/component/dateInput.component"
import { formatGuatemalaDate, isIsoDate } from "@/shared/utils/guatemalaDate"
import { Select } from "@/shared/component/select.component"
import { SearchInput } from "@/shared/component/searchInput.component"
import { PaginationComponent } from "@/shared/component/pagination.component"
import { useDebouncedValue } from "@/shared/hook/useDebouncedValue"
import {
    TableContainer,
    TableHeader,
    Table,
    TableHead,
    TableBody,
    TableRow,
    Th,
    Td,
    TableEmpty,
} from "@/shared/component/table.component"

const ESTADO_BADGE_VARIANT: Record<RmReception["status"], "info" | "aviso" | "exito"> = {
    pendiente_recepcion: "info",
    pendiente_evaluacion_calidad: "aviso",
    pendiente_asignacion_grn: "aviso",
    cerrado: "exito",
}

function numeroBoleta(id: number): string {
    return `#${id.toString().padStart(6, "0")}`
}

function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-text-tertiary">{label}</label>
            {children}
        </div>
    )
}

export function BoletaListView() {
    const [grnBoleta, setGrnBoleta] = useState<RmReception | null>(null)
    const { user } = useAuthentication()
    const [receiptNumber, setReceiptNumber] = useState("")
    const [grn, setGrn] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [producer, setProducer] = useState("")
    const [inspector, setInspector] = useState("")
    const [plate, setPlate] = useState("")
    const [carrier, setCarrier] = useState("")
    const [status, setStatus] = useState<"" | (typeof ESTADOS_BOLETA)[number]>("")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const filtersId = useId()
    const [currentPage, setCurrentPage] = useState(1)

    const debouncedProducer = useDebouncedValue(producer)
    const debouncedReceiptNumber = useDebouncedValue(receiptNumber)
    const debouncedGrn = useDebouncedValue(grn)
    const debouncedInspector = useDebouncedValue(inspector)
    const debouncedPlate = useDebouncedValue(plate)
    const debouncedCarrier = useDebouncedValue(carrier)

    const filters = useMemo(
        () => ({
            receiptNumber: Number(debouncedReceiptNumber) > 0 ? debouncedReceiptNumber : undefined,
            grn: debouncedGrn.trim() || undefined,
            startDate: isIsoDate(startDate) ? startDate : undefined,
            endDate: isIsoDate(endDate) ? endDate : undefined,
            producer: debouncedProducer || undefined,
            inspector: debouncedInspector || undefined,
            plate: debouncedPlate || undefined,
            carrier: debouncedCarrier || undefined,
            status: status || undefined,
        }),
        [debouncedReceiptNumber, debouncedGrn, startDate, endDate, debouncedProducer, debouncedInspector, debouncedPlate, debouncedCarrier, status]
    )

    const validDates = (!startDate || isIsoDate(startDate)) && (!endDate || isIsoDate(endDate))
        && (!startDate || !endDate || startDate <= endDate)

    const activeFilterCount = Object.values(filters).filter(Boolean).length
    const hasActiveFilters = activeFilterCount > 0

    useEffect(() => {
        setCurrentPage(1)
    }, [filters])

    const boletasQuery = useQuery({
        queryKey: ["rm-receptions", currentPage, filters],
        queryFn: () => listRmReceptionsApi({ ...filters, page: currentPage }),
        enabled: validDates,
        placeholderData: (previousData) => previousData,
    })

    function limpiarFiltros() {
        setReceiptNumber("")
        setGrn("")
        setStartDate("")
        setEndDate("")
        setProducer("")
        setInspector("")
        setPlate("")
        setCarrier("")
        setStatus("")
    }

    const boletas = validDates && !boletasQuery.isError ? boletasQuery.data?.data ?? [] : []
    const totalPages = boletasQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="full">
            <TableContainer>
                <TableHeader
                    title="Boletas de recepción de materia prima"
                    linkTo={user?.permissions.includes("rawMaterialReceptions:create") ? "/boletas/nueva" : undefined}
                    linkText={user?.permissions.includes("rawMaterialReceptions:create") ? "Crear boleta materia prima" : undefined}
                />

                {user?.permissions.includes("rawMaterialReceptions:downloadDocuments") && <ReceiptDownloads />}

                <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    id={`${filtersId}-trigger`}
                    aria-expanded={filtersOpen}
                    aria-controls={filtersId}
                    className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold text-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:max-w-sm ${filtersOpen ? "border-primary/50 bg-primary/10" : "border-border-light bg-bg-primary/60 hover:border-primary/50 hover:bg-primary/5"}`}
                >
                    <span className="flex items-center gap-2">
                        <Search size={18} className="text-primary-dark" aria-hidden="true" />
                        Buscar boletas
                        {hasActiveFilters && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-dark">
                                {activeFilterCount}
                            </span>
                        )}
                    </span>
                    <ChevronDown size={18} aria-hidden="true" className={`text-text-tertiary transition-transform duration-200 motion-reduce:transition-none ${filtersOpen ? "rotate-180" : ""}`} />
                </button>

                <div
                    id={filtersId}
                    role="region"
                    aria-labelledby={`${filtersId}-trigger`}
                    aria-hidden={!filtersOpen}
                    inert={!filtersOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                    <div className="min-h-0 overflow-hidden">
                    <div className="rounded-xl border border-border-light bg-bg-primary/40 p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <FilterField label="Número de boleta" htmlFor={`${filtersId}-receipt-number`}>
                            <Input id={`${filtersId}-receipt-number`} type="text" inputMode="numeric" preserveCase
                                value={receiptNumber} maxLength={16} placeholder="Ej. 000123"
                                onChange={event => {
                                    const value = event.target.value.trim().replace(/^(#|LX2-)/i, "")
                                    if (value === "" || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)))) setReceiptNumber(value)
                                }} />
                        </FilterField>
                        <FilterField label="GRN" htmlFor={`${filtersId}-grn`}>
                            <SearchInput id={`${filtersId}-grn`} value={grn} onChange={setGrn} placeholder="Ej. LP0080746 o 80746" />
                        </FilterField>
                        <FilterField label="Desde" htmlFor={`${filtersId}-start-date`}>
                            <DateInput id={`${filtersId}-start-date`} value={startDate} onChange={setStartDate} max={isIsoDate(endDate) ? endDate : undefined} />
                        </FilterField>
                        <FilterField label="Hasta" htmlFor={`${filtersId}-end-date`}>
                            <DateInput id={`${filtersId}-end-date`} value={endDate} onChange={setEndDate} min={isIsoDate(startDate) ? startDate : undefined} />
                        </FilterField>
                        <FilterField label="Productor" htmlFor={`${filtersId}-producer`}>
                            <SearchInput id={`${filtersId}-producer`} value={producer} onChange={setProducer} placeholder="Buscar productor..." />
                        </FilterField>
                        <FilterField label="Inspector" htmlFor={`${filtersId}-inspector`}>
                            <SearchInput id={`${filtersId}-inspector`} value={inspector} onChange={setInspector} placeholder="Buscar inspector..." />
                        </FilterField>
                        <FilterField label="Placa" htmlFor={`${filtersId}-plate`}>
                            <SearchInput id={`${filtersId}-plate`} value={plate} onChange={setPlate} placeholder="Buscar placa..." />
                        </FilterField>
                        <FilterField label="Transportista" htmlFor={`${filtersId}-carrier`}>
                            <SearchInput id={`${filtersId}-carrier`} value={carrier} onChange={setCarrier} placeholder="Buscar transportista..." />
                        </FilterField>
                        <FilterField label="Estado" htmlFor={`${filtersId}-status`}>
                            <Select id={`${filtersId}-status`} value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                                <option value="">Todos los estados</option>
                                {ESTADOS_BOLETA.map((estado) => (
                                    <option key={estado} value={estado}>
                                        {ESTADO_BOLETA_LABEL[estado]}
                                    </option>
                                ))}
                            </Select>
                        </FilterField>
                    </div>

                    <p className="mt-3 text-xs text-text-tertiary">Se filtra por la fecha del documento de recepción en Guatemala. Se incluyen ambos días. Las evaluaciones corresponden a esas boletas.</p>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-text-tertiary transition hover:text-dark"
                        >
                            <X size={14} />
                            Limpiar filtros
                        </button>
                    )}
                    </div>
                    </div>
                </div>

                {!validDates && <p role="alert" className="text-sm text-error-fg">Ingresa fechas válidas. Desde debe ser anterior o igual a Hasta.</p>}
                {boletasQuery.isError && <p role="alert" className="text-sm text-error-fg">{boletasQuery.error.message ?? "Error al cargar las boletas."}</p>}

                {boletasQuery.isLoading ? <LoadingSpinner /> : boletas.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Boleta</Th>
                                <Th>Fecha</Th>
                                <Th>GRN</Th>
                                <Th>Planta</Th>
                                <Th>Placa</Th>
                                <Th>Transportista</Th>
                                <Th>Producto</Th>
                                <Th>Productor</Th>
                                <Th>Inspector</Th>
                                <Th>Estado</Th>
                                <Th align="center">Consignado</Th>
                                <Th align="center">Acciones</Th>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {boletas.map((boleta) => {
                                const detalle = boleta.fieldDataReceptions[0]
                                return (
                                    <TableRow key={boleta.id}>
                                        <Td className="font-medium">{numeroBoleta(boleta.id)}</Td>
                                        <Td className="whitespace-nowrap text-text-tertiary">{formatGuatemalaDate(boleta.docDate)}</Td>
                                        <Td className="text-text-tertiary">{boleta.grn ?? "—"}</Td>
                                        <Td className="text-text-tertiary">{boleta.plant?.name ?? (boleta.status === "pendiente_recepcion" ? "Por recibir" : "Sin asignar")}</Td>
                                        <Td className="text-text-tertiary">{detalle?.plate?.name ?? "—"}</Td>
                                        <Td className="text-text-tertiary">{detalle?.carrier?.name ?? "—"}</Td>
                                        <Td>
                                            <p className="font-medium text-dark">{detalle?.product.name ?? "—"}</p>
                                            {detalle?.product.varietyProduct?.name && (
                                                <p className="mt-1 text-xs font-medium text-primary-dark">
                                                    Variedad: {detalle.product.varietyProduct.name}
                                                </p>
                                            )}
                                        </Td>
                                        <Td className="text-text-tertiary">{detalle?.producer.name ?? "—"}</Td>
                                        <Td className="text-text-tertiary">{detalle?.inspectorName ?? "—"}</Td>
                                        <Td>
                                            <Badge variant={ESTADO_BADGE_VARIANT[boleta.status]}>
                                                {ESTADO_BOLETA_LABEL[boleta.status]}
                                            </Badge>
                                        </Td>
                                        <Td align="center" className="text-text-tertiary">
                                            <Badge variant={boleta.consignment ? "error" : "exito"}>
                                                {boleta.consignment ? "Sí" : "No"}
                                            </Badge>
                                            {!!boleta.qualityReasons?.length && <ul className="mt-2 max-w-64 space-y-1 text-left text-xs text-error-fg">{boleta.qualityReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
                                        </Td>
                                        <Td align="center">
                                            <ReceptionRowActions boleta={boleta} permissions={receiptActionPermissions(boleta, user)} roleName={user?.role} onAssignGrn={setGrnBoleta} />
                                        </Td>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <TableEmpty
                        message={
                            hasActiveFilters
                                ? "No se encontraron boletas con esos filtros."
                                : "Aún no hay boletas registradas."
                        }
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
            {grnBoleta && <AssignGrnModal boleta={grnBoleta} onClose={() => setGrnBoleta(null)} />}
        </PageContainer>
    )
}
