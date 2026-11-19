import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { listCdpsWithFiltersApi, deleteCdpApi } from "@/features/cdps/api/cdp.api"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
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
    TableActions,
} from "@/shared/component/table.component"

export function CdpListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("cdps:create") ?? false
    const canEdit = user?.permissions.includes("cdps:edit") ?? false
    const canDelete = user?.permissions.includes("cdps:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const cdpsQuery = useQuery({
        queryKey: ["cdps", currentPage, debouncedSearch],
        queryFn: () => listCdpsWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteCdpApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["cdps"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (cdpsQuery.isLoading) return <LoadingSpinner />
    if (cdpsQuery.isError)
        return <p className="text-center text-error-fg">{cdpsQuery.error?.message ?? "Error al cargar los CDP."}</p>

    const cdps = cdpsQuery.data?.data ?? []
    const totalPages = cdpsQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="compact">
            <TableContainer>
                <TableHeader title="CDP" linkTo={canCreate ? "/cdps/nuevo" : undefined} linkText="Nuevo CDP" />

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar por nombre de CDP..."
                    className="sm:max-w-sm"
                />

                {cdps.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Nombre de CDP</Th>
                                <Th>Finca</Th>
                                {(canEdit || canDelete) && <Th align="center">Acciones</Th>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cdps.map((cdp) => (
                                <TableRow key={cdp.id}>
                                    <Td className="font-medium">{cdp.name}</Td>
                                    <Td className="text-text-tertiary">{cdp.finca?.name ?? "—"}</Td>
                                    {(canEdit || canDelete) && <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/cdps/${cdp.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canDelete && <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`¿Eliminar el CDP "${cdp.name}"?`)) {
                                                        deleteMutation.mutate(cdp.id)
                                                    }
                                                }}
                                                disabled={deleteMutation.isPending}
                                                className="btn-icon text-error-fg transition hover:bg-error-bg disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>}
                                        </TableActions>
                                    </Td>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <TableEmpty
                        message={search ? "No se encontraron CDP con ese criterio." : "Aún no hay CDP registrados."}
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
