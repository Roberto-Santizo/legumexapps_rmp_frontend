import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { listRolesWithFiltersApi, deleteRoleApi } from "@/features/roles/api/role.api"
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

export function RoleListView() {
    const { user } = useAuthentication()
    const canCreate = user?.permissions.includes("roles:create") ?? false
    const canEdit = user?.permissions.includes("roles:edit") ?? false
    const canDelete = user?.permissions.includes("roles:delete") ?? false
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const rolesQuery = useQuery({
        queryKey: ["roles", currentPage, debouncedSearch],
        queryFn: () => listRolesWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteRoleApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["roles"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (rolesQuery.isLoading) return <LoadingSpinner />
    if (rolesQuery.isError)
        return <p className="text-center text-error-fg">{rolesQuery.error?.message ?? "Error al cargar los roles."}</p>

    const roles = rolesQuery.data?.data ?? []
    const totalPages = rolesQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="wide">
            <TableContainer>
                <TableHeader title="Roles" linkTo={canCreate ? "/roles/nuevo" : undefined} linkText="Nuevo rol" />

                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre..." className="sm:max-w-sm" />

                {roles.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Nombre</Th>
                                {(canEdit || canDelete) && <Th align="center">Acciones</Th>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <Td className="font-medium">{role.name}</Td>
                                    {(canEdit || canDelete) && <Td align="center">
                                        <TableActions>
                                            {canEdit && <Link
                                                to={`/roles/${role.id}/editar`}
                                                className="btn-icon btn-icon-primary"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </Link>}
                                            {canDelete && <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`¿Eliminar el rol "${role.name}"?`)) {
                                                        deleteMutation.mutate(role.id)
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
                        message={search ? "No se encontraron roles con ese criterio." : "Aún no hay roles registrados."}
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
        </PageContainer>
    )
}
