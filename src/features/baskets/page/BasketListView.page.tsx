import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { formatDecimal } from "@/shared/utils/formatDecimal"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { listBasketsWithFiltersApi, deleteBasketApi } from "@/features/baskets/api/basket.api"
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

export function BasketListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("baskets:create") ?? false
    const canEdit = user?.permissions.includes("baskets:edit") ?? false
    const canDelete = user?.permissions.includes("baskets:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const basketsQuery = useQuery({
        queryKey: ["baskets", currentPage, debouncedSearch],
        queryFn: () => listBasketsWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteBasketApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["baskets"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (basketsQuery.isLoading) return <LoadingSpinner />
    if (basketsQuery.isError)
        return <p className="text-center text-error-fg">{basketsQuery.error?.message ?? "Error al cargar las canastas."}</p>

    const baskets = basketsQuery.data?.data ?? []
    const totalPages = basketsQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="compact">
            <TableContainer>
                <TableHeader title="Canastas" linkTo={canCreate ? "/canastas/nueva" : undefined} linkText="Nueva canasta" />

                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código..." className="sm:max-w-sm" />

                {baskets.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Código</Th>
                                <Th align="center">Peso (lb)</Th>
                                {(canEdit || canDelete) && <Th align="center">Acciones</Th>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {baskets.map((basket) => (
                                <TableRow key={basket.id}>
                                    <Td className="font-medium">{basket.code}</Td>
                                    <Td align="center" className="text-text-tertiary">
                                        {formatDecimal(basket.weight)}
                                    </Td>
                                    {(canEdit || canDelete) && <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/canastas/${basket.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canDelete && <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`¿Eliminar la canasta "${basket.code}"?`)) {
                                                        deleteMutation.mutate(basket.id)
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
                        message={
                            search ? "No se encontraron canastas con ese criterio." : "Aún no hay canastas registradas."
                        }
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
