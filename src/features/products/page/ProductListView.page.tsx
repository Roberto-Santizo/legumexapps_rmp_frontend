import { formatDecimal } from "@/shared/utils/formatDecimal"
import { Badge } from "@/shared/component/badge.component"
import { StatusAction } from "@/shared/component/statusAction.component"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { listProductsWithFiltersApi, toggleProductEstadoApi } from "@/features/products/api/product.api"
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

export function ProductListView() {
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const canEdit = user?.permissions.includes("products:edit") ?? false
    const canCreate = user?.permissions.includes("products:create") ?? false
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const productsQuery = useQuery({
        queryKey: ["products", currentPage, debouncedSearch],
        queryFn: () => listProductsWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const statusMutation = useMutation({
        mutationFn: toggleProductEstadoApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (productsQuery.isLoading) return <LoadingSpinner />
    if (productsQuery.isError)
        return <p className="text-center text-error-fg">{productsQuery.error?.message ?? "Error al cargar los productos."}</p>

    const products = productsQuery.data?.data ?? []
    const totalPages = productsQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="medium">
            <TableContainer>
                <TableHeader title="Productos" linkTo={canCreate ? "/productos/nuevo" : undefined} linkText="Nuevo producto" />

                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre..." className="sm:max-w-sm" />

                {products.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Nombre</Th>
                                <Th>Variedad</Th>
                                <Th align="center">% Aceptado</Th>
                                <Th>Estado</Th>
                                <Th align="center">Acciones</Th>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <Td className="font-medium">{product.name}</Td>
                                    <Td className="text-text-tertiary">{product.varietyProduct?.name ?? "—"}</Td>
                                    <Td align="center" className="text-text-tertiary">
                                        {formatDecimal(product.acceptedPercentage)}%
                                    </Td>
                                    <Td><Badge variant={product.activo ? "exito" : "error"}>{product.activo ? "Activo" : "Inactivo"}</Badge></Td>
                                    <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/productos/${product.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canEdit && <StatusAction
                                                active={product.activo}
                                                name={product.name}
                                                disabled={statusMutation.isPending}
                                                onChange={activo => statusMutation.mutate({ id: product.id, activo })}
                                            />}
                                        </TableActions>
                                    </Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <TableEmpty
                        message={
                            search ? "No se encontraron productos con ese criterio." : "Aún no hay productos registrados."
                        }
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
