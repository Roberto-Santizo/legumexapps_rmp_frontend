import { StatusAction } from "@/shared/component/statusAction.component"
import { Badge } from "@/shared/component/badge.component"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { listCarriersWithFiltersApi, toggleCarrierEstadoApi } from "@/features/carriers/api/carrier.api"
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

export function CarrierListView() {
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const canEdit = user?.permissions.includes("transport:edit") ?? false
    const canCreate = user?.permissions.includes("transport:create") ?? false
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const carriersQuery = useQuery({
        queryKey: ["carriers", currentPage, debouncedSearch],
        queryFn: () => listCarriersWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const statusMutation = useMutation({
        mutationFn: toggleCarrierEstadoApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["carriers"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (carriersQuery.isLoading) return <LoadingSpinner />
    if (carriersQuery.isError)
        return (
            <p className="text-center text-error-fg">
                {carriersQuery.error?.message ?? "Error al cargar los transportistas."}
            </p>
        )

    const carriers = carriersQuery.data?.data ?? []
    const totalPages = carriersQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="compact">
            <TableContainer>
                <TableHeader title="Transportistas" linkTo={canCreate ? "/transportistas/nuevo" : undefined} linkText="Nuevo transportista" />

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar por código o nombre..."
                    className="sm:max-w-sm"
                />

                {carriers.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Código</Th>
                                <Th>Nombre</Th>
                                <Th>Estado</Th>
                                <Th align="center">Acciones</Th>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {carriers.map((carrier) => (
                                <TableRow key={carrier.id}>
                                    <Td className="font-medium">{carrier.code}</Td>
                                    <Td className="text-text-tertiary">{carrier.name}</Td>
                                    <Td><Badge variant={carrier.activo ? "exito" : "error"}>{carrier.activo ? "Activo" : "Inactivo"}</Badge></Td>
                                    <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/transportistas/${carrier.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canEdit && <StatusAction
                                                active={carrier.activo}
                                                name={carrier.name}
                                                disabled={statusMutation.isPending}
                                                onChange={activo => statusMutation.mutate({ id: carrier.id, activo })}
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
                            search
                                ? "No se encontraron transportistas con ese criterio."
                                : "Aún no hay transportistas registrados."
                        }
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
