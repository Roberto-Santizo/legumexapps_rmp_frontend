import { StatusAction } from "@/shared/component/statusAction.component"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { listUsersWithFiltersApi, toggleUserEstadoApi } from "@/features/users/api/user.api"
import { Badge } from "@/shared/component/badge.component"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { SearchInput } from "@/shared/component/searchInput.component"
import { PaginationComponent } from "@/shared/component/pagination.component"
import { useDebouncedValue } from "@/shared/hook/useDebouncedValue"
import { CarrierRepresentativeModal } from "../component/CarrierRepresentativeModal"
import type { User } from "../schema/user.schema"
import { Truck, Factory } from "lucide-react"
import { UserPlantModal } from "../component/UserPlantModal"
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

export function UserListView() {
    const queryClient = useQueryClient()
    const { user: currentUser } = useAuthentication()
    const canEdit = currentUser?.permissions.includes("users:edit") ?? false
    const canCreate = currentUser?.permissions.includes("users:create") ?? false
    const [search, setSearch] = useState("")
    const [representativeUser, setRepresentativeUser] = useState<User | null>(null)
    const [plantUser, setPlantUser] = useState<User | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    const usersQuery = useQuery({
        queryKey: ["users", currentPage, debouncedSearch],
        queryFn: () => listUsersWithFiltersApi({ page: currentPage, search: debouncedSearch || undefined }),
        placeholderData: (previousData) => previousData,
    })

    const toggleEstadoMutation = useMutation({
        mutationFn: toggleUserEstadoApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => toast.error(error.message),
    })

    if (usersQuery.isLoading) return <LoadingSpinner />
    if (usersQuery.isError)
        return <p className="text-center text-error-fg">{usersQuery.error?.message ?? "Error al cargar los usuarios."}</p>

    const users = usersQuery.data?.data ?? []
    const totalPages = usersQuery.data?.meta.totalPages ?? 1

    return (
        <PageContainer size="wide">
            <TableContainer>
                <TableHeader title="Usuarios" linkTo={canCreate ? "/usuarios/nuevo" : undefined} linkText="Nuevo usuario" />

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar por nombre o usuario..."
                    className="sm:max-w-sm"
                />

                {users.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Th>Nombre</Th>
                                <Th>Usuario</Th>
                                <Th>Rol</Th>
                                <Th>Planta</Th>
                                <Th>Transportista representado</Th>
                                <Th>Estado</Th>
                                <Th align="center">Acciones</Th>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <Td className="font-medium">{user.name}</Td>
                                    <Td className="text-text-tertiary">{user.username}</Td>
                                    <Td>
                                        <Badge variant="info">{user.role.name}</Badge>
                                    </Td>
                                    <Td>{user.plant?.name ?? "Sin asignar"}</Td>
                                    <Td>{user.representedCarrier?.name ?? "—"}</Td>
                                    <Td>
                                        <Badge variant={user.activo ? "exito" : "error"}>
                                            {user.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </Td>
                                    <Td align="center">
                                        <TableActions>
                                            {canEdit && <button type="button" className="btn-icon btn-icon-primary" onClick={() => setPlantUser(user)} aria-label={`Asignar planta a ${user.name}`} title="Asignar planta"><Factory size={16} aria-hidden="true" /></button>}
                                            {canEdit && user.role.name.trim().toLocaleLowerCase("es") === "campo" && <button type="button" className="btn-icon btn-icon-primary" onClick={() => setRepresentativeUser(user)} aria-label={`Asignar transportista a ${user.name}`} title="Asignar transportista representado"><Truck size={16} aria-hidden="true" /></button>}
                                            {canEdit && <StatusAction
                                                active={user.activo}
                                                name={user.name}
                                                onChange={activo => toggleEstadoMutation.mutate({ id: user.id, activo })}
                                                disabled={toggleEstadoMutation.isPending || currentUser?.id === user.id}
                                                disabledReason={currentUser?.id === user.id ? "No puedes desactivar tu propia cuenta" : undefined}
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
                            search ? "No se encontraron usuarios con ese criterio." : "Aún no hay usuarios registrados."
                        }
                    />
                )}

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </TableContainer>
            {representativeUser && <CarrierRepresentativeModal key={representativeUser.id} user={representativeUser} onClose={() => setRepresentativeUser(null)} />}
            {plantUser && <UserPlantModal key={plantUser.id} user={plantUser} onClose={() => setPlantUser(null)} />}
        </PageContainer>
    )
}
