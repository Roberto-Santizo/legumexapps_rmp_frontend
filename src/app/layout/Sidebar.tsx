import { Link } from "react-router-dom"
import { Navigation } from "@/app/layout/Navigation"
import { ShellSidebar } from "@/shared/layout/ShellSidebar"
import { LegumexLogoStacked } from "@/shared/component/LegumexLogoStacked"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { navigationTopLinks, navigationCategories, navigationLinks, canViewNavigationItem } from "../navigation/navigation.config"

export function Sidebar({ mobileMenuOpen, onClose }: { mobileMenuOpen: boolean; onClose: () => void }) {
    const { user } = useAuthentication()
    const home = [...navigationTopLinks, ...navigationCategories.flatMap(category => category.items), ...navigationLinks]
        .find(item => canViewNavigationItem(item, user?.permissions ?? [], user?.role))?.path ?? "/ayuda"
    return <ShellSidebar open={mobileMenuOpen} onClose={onClose} brand={<Link to={home} onClick={onClose} aria-label="Legumex RMP · Inicio"><LegumexLogoStacked /></Link>}>
        <Navigation onNavigate={onClose} />
    </ShellSidebar>
}
