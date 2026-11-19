import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { SearchInput } from "@/shared/component/searchInput.component"
import { PaginationComponent } from "@/shared/component/pagination.component"
import { useDebouncedValue } from "@/shared/hook/useDebouncedValue"
import { TableContainer, TableHeader, Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty, TableActions } from "@/shared/component/table.component"
import { listProducersWithFiltersApi, deleteProducerApi } from "../api/producer.api"

export function ProducerListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("producers:create") ?? false
    const canEdit = user?.permissions.includes("producers:edit") ?? false
    const canDelete = user?.permissions.includes("producers:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)
    useEffect(() => { setCurrentPage(1) }, [debouncedSearch])
    const producersQuery = useQuery({
        queryKey: ["producers", "list", currentPage, debouncedSearch],
        queryFn: () => listProducersWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: previous => previous,
    })
    const deleteMutation = useMutation({
        mutationFn: deleteProducerApi,
        onSuccess: async result => {
            if (!result) return
            toast.success(result.message)
            if (producersQuery.data?.data.length === 1 && currentPage > 1) setCurrentPage(page => page - 1)
            await queryClient.invalidateQueries({ queryKey: ["producers"] })
        },
        onError: error => toast.error(error.message),
    })
    if (producersQuery.isLoading) return <LoadingSpinner />
    if (producersQuery.isError) return <PageContainer size="compact"><p role="alert" className="text-center text-error-fg">{producersQuery.error.message}</p></PageContainer>
    const producers = producersQuery.data?.data ?? []

    return <PageContainer size="compact">
        <TableContainer>
            <TableHeader title="Productores" linkTo={canCreate ? "/productores/nuevo" : undefined} linkText="Nuevo productor" />
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código o nombre del productor..." className="sm:max-w-sm" />
            {producers.length > 0 ? <Table>
                <TableHead><TableRow><Th>Código</Th><Th>Nombre del productor</Th>{(canEdit || canDelete) && <Th align="center">Acciones</Th>}</TableRow></TableHead>
                <TableBody>{producers.map(producer => <TableRow key={producer.id}>
                    <Td className="font-medium">{producer.code}</Td>
                    <Td>{producer.name}</Td>
                    {(canEdit || canDelete) && <Td align="center"><TableActions>
                        {canEdit && <Link to={`/productores/${producer.id}/editar`} className="btn-icon btn-icon-primary" title="Editar" aria-label={`Editar productor ${producer.name}`}><Pencil size={16} /></Link>}
                        {canDelete && <button type="button" title="Eliminar" aria-label={`Eliminar productor ${producer.name}`} disabled={deleteMutation.isPending}
                            className="btn-icon text-error-fg transition hover:bg-error-bg disabled:opacity-50"
                            onClick={() => { if (window.confirm(`¿Eliminar el productor "${producer.name}"?`)) deleteMutation.mutate(producer.id) }}><Trash2 size={16} /></button>}
                    </TableActions></Td>}
                </TableRow>)}</TableBody>
            </Table> : <TableEmpty message={search ? "No se encontraron productores con ese criterio." : "Aún no hay productores registrados."} />}
            <PaginationComponent currentPage={currentPage} totalPages={producersQuery.data?.meta.totalPages ?? 1} onPageChange={setCurrentPage} />
        </TableContainer>
    </PageContainer>
}
