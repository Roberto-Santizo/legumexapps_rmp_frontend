import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { listVarietyProductsWithFiltersApi, deleteVarietyProductApi } from "@/features/varietyProducts/api/varietyProduct.api"
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

export function VarietyProductListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("products:create") ?? false
    const canEdit = user?.permissions.includes("products:edit") ?? false
    const canDelete = user?.permissions.includes("products:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const varietyProductsQuery = useQuery({
        queryKey: ["variety-products", currentPage, debouncedSearch],
        queryFn: () => listVarietyProductsWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteVarietyProductApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["variety-products"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (varietyProductsQuery.isLoading) return <LoadingSpinner />
    if (varietyProductsQuery.isError)
        return (
            <p className="text-center text-error-fg">
                {varietyProductsQuery.error?.message ?? "Error al cargar las variedades."}
            </p>
        )

    const varietyProducts = varietyProductsQuery.data?.data ?? []
    const totalPages = varietyProductsQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="compact">
            <TableContainer>
                <TableHeader title="Variedades" linkTo={canCreate ? "/variedades/nueva" : undefined} linkText="Nueva variedad" />

                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre..." className="sm:max-w-sm" />

                {varietyProducts.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Nombre</Th>
                                {(canEdit || canDelete) && <Th align="center">Acciones</Th>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {varietyProducts.map((varietyProduct) => (
                                <TableRow key={varietyProduct.id}>
                                    <Td className="font-medium">{varietyProduct.name}</Td>
                                    {(canEdit || canDelete) && <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/variedades/${varietyProduct.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canDelete && <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`¿Eliminar la variedad "${varietyProduct.name}"?`)) {
                                                        deleteMutation.mutate(varietyProduct.id)
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
                            search ? "No se encontraron variedades con ese criterio." : "Aún no hay variedades registradas."
                        }
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
