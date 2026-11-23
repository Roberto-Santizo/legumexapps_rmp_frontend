import { useId, useState } from "react"
import type { FormEvent } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, Download, LoaderCircle } from "lucide-react"
import { Button } from "@/shared/component/button.component"
import { Select } from "@/shared/component/select.component"
import { DateInput } from "@/shared/component/dateInput.component"
import { Combobox } from "@/shared/component/combobox.component"
import { PaginationComponent } from "@/shared/component/pagination.component"
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/shared/component/table.component"
import { formatGuatemalaDate, isIsoDate } from "@/shared/utils/guatemalaDate"
import { listDownloadProducersApi, searchReceptionDownloadsApi } from "../api/rmReception.api"
import { useReceiptDownloads } from "../hook/useReceiptDownloads"
import type { ReceiptDownloadKind } from "../pdf/receiptDownloads"

export function ReceiptDownloads() {
    const [open, setOpen] = useState(false)
    const id = useId()
    return <div>
        <Button type="button" variant="secondary" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
            <Download size={18} aria-hidden="true" />Descargar boletas
            <ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} />
        </Button>
        {open && <div id={id} className="mt-4"><ReceiptDownloadPanel /></div>}
    </div>
}

function ReceiptDownloadPanel() {
    const id = useId()
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [producerId, setProducerId] = useState<number | null>(null)
    const [selection, setSelection] = useState<{ startDate: string; endDate: string; producerId?: number } | null>(null)
    const producersQuery = useQuery({ queryKey: ["download-producers"], queryFn: listDownloadProducersApi, staleTime: 5 * 60 * 1000 })
    const producerOptions = (producersQuery.data?.data ?? []).map(producer => ({
        value: producer.id, label: producer.name,
        description: [producer.code, producer.activo ? "" : "Inactivo"].filter(Boolean).join(" · ") || undefined,
    }))
    const selectedProducer = producerOptions.find(option => option.value === selection?.producerId)
    const [page, setPage] = useState(1)
    const downloads = useReceiptDownloads()
    const valid = isIsoDate(startDate) && isIsoDate(endDate) && startDate <= endDate
    const dirty = !selection || startDate !== selection.startDate || endDate !== selection.endDate || (producerId ?? undefined) !== selection.producerId
    const query = useQuery({
        queryKey: ["receipt-download-search", selection, page],
        queryFn: ({ signal }) => searchReceptionDownloadsApi({ ...selection!, page }, signal),
        enabled: !!selection,
        gcTime: 0,
    })
    const ready = !dirty && valid && !query.isFetching && !query.isError && !!query.data
    const total = query.data?.meta.total ?? 0

    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!valid) return
        setPage(1)
        setSelection({ startDate, endDate, producerId: producerId ?? undefined })
        if (!dirty && page === 1) void query.refetch()
    }

    return <section aria-label="Descarga por fechas y productor" className="space-y-4 rounded-xl border border-border-light bg-bg-primary/40 p-4 sm:p-6">
        <div><h3 className="font-semibold text-dark">Filtrar boletas para descargar</h3>
            <p className="text-sm text-text-tertiary">Elige la fecha del documento de recepción. Se incluyen ambos días y las evaluaciones de calidad de esas boletas.</p></div>
        <form onSubmit={search}>
            <fieldset disabled={!!downloads.progress} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div><label htmlFor={`${id}-from`} className="mb-1 block text-sm font-medium">Desde</label>
                    <DateInput id={`${id}-from`} value={startDate} onChange={setStartDate} required max={isIsoDate(endDate) ? endDate : undefined} /></div>
                <div><label htmlFor={`${id}-to`} className="mb-1 block text-sm font-medium">Hasta</label>
                    <DateInput id={`${id}-to`} value={endDate} onChange={setEndDate} required min={isIsoDate(startDate) ? startDate : undefined} /></div>
                <div><label htmlFor={`${id}-producer`} className="mb-1 block text-sm font-medium">Productor</label>
                    <Combobox id={`${id}-producer`} value={producerId} onChange={setProducerId} options={producerOptions}
                        placeholder="Todos los productores" emptyMessage="No se encontraron productores"
                        loading={producersQuery.isLoading} disabled={producersQuery.isError} /></div>
                <Button type="submit" variant="secondary" className="self-end" disabled={!valid || query.isFetching}>Buscar boletas para descargar</Button>
            </fieldset>
        </form>
        <p className="text-xs text-text-tertiary">Selecciona un productor para descargar solo sus boletas dentro del rango. Déjalo vacío para incluir todos los productores.</p>
        {producersQuery.isError && <p role="alert" className="text-sm text-error-fg">No se pudo cargar la lista de productores. Puedes descargar todas las boletas del rango.</p>}
        {startDate && endDate && !valid && <p role="alert" className="text-sm text-error-fg">Ingresa fechas válidas. Desde debe ser anterior o igual a Hasta.</p>}
        {query.isFetching && <p role="status" className="text-sm text-text-tertiary">Buscando boletas...</p>}
        {query.isError && <p role="alert" className="text-sm text-error-fg">{query.error.message}</p>}
        {selection && dirty && <p role="status" className="text-sm text-text-tertiary">Aplica los filtros con Buscar boletas para descargar.</p>}
        {ready && <>
            <p role="status" className="text-sm text-dark">
                Del <span className="font-semibold">{formatGuatemalaDate(selection!.startDate)}</span> al <span className="font-semibold">{formatGuatemalaDate(selection!.endDate)}</span>
                {" · "}{selectedProducer ? <>Productor: <span className="font-semibold">{selectedProducer.label}</span></> : "Todos los productores"}
            </p>
            {total === 0 ? <p role="status" className="text-sm text-text-tertiary">No se encontraron boletas con esas fechas y productor.</p> : <>
                <Table><TableHead><TableRow><Th>Boleta</Th><Th>Fecha</Th><Th>Productor</Th><Th>Producto</Th><Th>Descargar PDF</Th></TableRow></TableHead>
                    <TableBody>{query.data!.data.map(receipt => <TableRow key={receipt.id}>
                        <Td>LX2-{receipt.id}</Td><Td>{formatGuatemalaDate(receipt.docDate)}</Td>
                        <Td>{receipt.fieldDataReceptions[0]?.producer.name ?? "—"}</Td><Td>{receipt.fieldDataReceptions[0]?.product.name ?? "—"}</Td>
                        <Td><div className="flex gap-2">
                            <Button type="button" variant="secondary" disabled={!!downloads.progress} aria-label={`Descargar amarilla LX2-${receipt.id}`}
                                onClick={() => { void downloads.download(selection, "receipt", receipt.id) }}>Amarilla</Button>
                            <Button type="button" variant="secondary" disabled={!!downloads.progress || (receipt.status !== "cerrado" && receipt.status !== "pendiente_asignacion_grn")}
                                aria-label={`Descargar evaluación de calidad de LX2-${receipt.id}`}
                                onClick={() => { void downloads.download(selection, "quality", receipt.id) }}>Calidad</Button>
                        </div></Td>
                    </TableRow>)}</TableBody>
                </Table>
                <PaginationComponent currentPage={page} totalPages={query.data!.meta.totalPages} onPageChange={setPage} />
            </>}
        </>}
        {total > 200 && ready && <p role="status" className="text-sm text-text-tertiary">Hay más de 200 boletas. Reduce las fechas o filtra por productor para descargarlas en ZIP.</p>}
        {selection && <ReceiptBulkDownload disabled={!ready || !total || total > 200} total={ready ? total : undefined}
            progress={downloads.progress} onCancel={downloads.cancel} onDownload={kind => { void downloads.download(selection, kind) }} />}
    </section>
}

export function ReceiptBulkDownload({ disabled, total, progress, onDownload, onCancel }: {
    disabled: boolean
    total?: number
    progress: string
    onDownload: (kind: ReceiptDownloadKind) => void
    onCancel: () => void
}) {
    const [kind, setKind] = useState<ReceiptDownloadKind>("both")
    const id = useId()
    return <section className="space-y-3 rounded-xl border border-border-light bg-bg-primary/40 p-4" aria-label="Descarga de boletas">
        <div><h3 className="font-semibold text-dark">Descargar boletas filtradas</h3>
            <p className="text-sm text-text-tertiary">El ZIP incluye todas las páginas de las fechas y el productor consultados, hasta 200 boletas por descarga.</p></div>
        {total !== undefined && <p className="text-sm font-medium text-dark" role="status">{total} {total === 1 ? "boleta encontrada" : "boletas encontradas"}</p>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:min-w-64"><label htmlFor={id} className="mb-1 block text-sm font-medium">Documentos a incluir</label>
                <Select id={id} value={kind} disabled={!!progress} onChange={event => setKind(event.target.value as ReceiptDownloadKind)}>
                    <option value="both">Amarillas y evaluaciones de calidad</option>
                    <option value="receipt">Solo boletas amarillas</option>
                    <option value="quality">Solo evaluaciones de calidad</option>
                </Select></div>
            <Button type="button" disabled={disabled || !!progress} onClick={() => onDownload(kind)}>
                {progress ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
                {progress ? "Preparando descarga..." : "Descargar todas en ZIP"}
            </Button>
            {progress && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        </div>
        <p className="text-xs text-text-tertiary">Las boletas sin evaluación incluyen únicamente su amarilla.</p>
        {progress && <p role="status" aria-live="polite" className="text-sm text-primary-dark">{progress}</p>}
    </section>
}
