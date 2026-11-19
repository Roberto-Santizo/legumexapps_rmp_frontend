import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { listPlatesWithFiltersApi, deletePlateApi } from "@/features/plates/api/plate.api"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { SearchInput } from "@/shared/component/searchInput.component"
import { PaginationComponent } from "@/shared/component/pagination.component"
import { useDebouncedValue } from "@/shared/hook/useDebouncedValue"
import { formatDecimal } from "@/shared/utils/formatDecimal"
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

export function PlateListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("transport:create") ?? false
    const canEdit = user?.permissions.includes("transport:edit") ?? false
    const canDelete = user?.permissions.includes("transport:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const platesQuery = useQuery({
        queryKey: ["plates", currentPage, debouncedSearch],
        queryFn: () => listPlatesWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: deletePlateApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["plates"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (platesQuery.isLoading) return <LoadingSpinner />
    if (platesQuery.isError)
        return <p className="text-center text-error-fg">{platesQuery.error?.message ?? "Error al cargar las placas."}</p>

    const plates = platesQuery.data?.data ?? []
    const totalPages = platesQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="compact">
            <TableContainer>
                <TableHeader title="Placas" linkTo={canCreate ? "/placas/nueva" : undefined} linkText="Nueva placa" />

                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por placa..." className="sm:max-w-sm" />

                {plates.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Placa</Th>
                                <Th>Transportista</Th>
                                <Th>Peso bruto máximo (lb)</Th>
                                {(canEdit || canDelete) && <Th align="center">Acciones</Th>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {plates.map((plate) => (
                                <TableRow key={plate.id}>
                                    <Td className="font-medium">{plate.name}</Td>
                                    <Td className="text-text-tertiary">{plate.carrier?.name ?? "—"}</Td>
                                    <Td className="text-text-tertiary">{plate.maxGrossWeight == null ? "Sin configurar" : formatDecimal(plate.maxGrossWeight)}</Td>
                                    {(canEdit || canDelete) && <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/placas/${plate.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canDelete && <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`¿Eliminar la placa "${plate.name}"?`)) {
                                                        deleteMutation.mutate(plate.id)
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
                        message={search ? "No se encontraron placas con ese criterio." : "Aún no hay placas registradas."}
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
