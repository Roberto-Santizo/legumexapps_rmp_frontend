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
import { listFincasWithFiltersApi, deleteFincaApi } from "../api/finca.api"

export function FincaListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("farms:create") ?? false
    const canEdit = user?.permissions.includes("farms:edit") ?? false
    const canDelete = user?.permissions.includes("farms:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)
    useEffect(() => { setCurrentPage(1) }, [debouncedSearch])
    const fincasQuery = useQuery({
        queryKey: ["farms", "list", currentPage, debouncedSearch],
        queryFn: () => listFincasWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: previous => previous,
    })
    const deleteMutation = useMutation({
        mutationFn: deleteFincaApi,
        onSuccess: async result => {
            if (!result) return
            toast.success(result.message)
            if (fincasQuery.data?.data.length === 1 && currentPage > 1) setCurrentPage(page => page - 1)
            await queryClient.invalidateQueries({ queryKey: ["farms"] })
        },
        onError: error => toast.error(error.message),
    })
    if (fincasQuery.isLoading) return <LoadingSpinner />
    if (fincasQuery.isError) return <PageContainer size="compact"><p role="alert" className="text-center text-error-fg">{fincasQuery.error.message}</p></PageContainer>
    const fincas = fincasQuery.data?.data ?? []

    return <PageContainer size="compact">
        <TableContainer>
            <TableHeader title="Fincas" linkTo={canCreate ? "/fincas/nueva" : undefined} linkText="Nueva finca" />
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre de finca..." className="sm:max-w-sm" />
            {fincas.length > 0 ? <Table>
                <TableHead><TableRow><Th>Nombre de finca</Th>{(canEdit || canDelete) && <Th align="center">Acciones</Th>}</TableRow></TableHead>
                <TableBody>{fincas.map(finca => <TableRow key={finca.id}>
                    <Td className="font-medium">{finca.name}</Td>
                    {(canEdit || canDelete) && <Td align="center"><TableActions>
                        {canEdit && <Link to={`/fincas/${finca.id}/editar`} className="btn-icon btn-icon-primary" title="Editar" aria-label={`Editar finca ${finca.name}`}><Pencil size={16} /></Link>}
                        {canDelete && <button type="button" title="Eliminar" aria-label={`Eliminar finca ${finca.name}`} disabled={deleteMutation.isPending}
                            className="btn-icon text-error-fg transition hover:bg-error-bg disabled:opacity-50"
                            onClick={() => { if (window.confirm(`¿Eliminar la finca "${finca.name}"?`)) deleteMutation.mutate(finca.id) }}><Trash2 size={16} /></button>}
                    </TableActions></Td>}
                </TableRow>)}</TableBody>
            </Table> : <TableEmpty message={search ? "No se encontraron fincas con ese criterio." : "Aún no hay fincas registradas."} />}
            <PaginationComponent currentPage={currentPage} totalPages={fincasQuery.data?.meta.totalPages ?? 1} onPageChange={setCurrentPage} />
        </TableContainer>
    </PageContainer>
}
