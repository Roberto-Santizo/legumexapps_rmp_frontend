export function LoadingSpinner() {
    return (
        <div role="status" aria-label="Cargando" className="flex items-center justify-center py-12">
            <div aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-[3px] border-border-light border-t-primary" />
        </div>
    )
}
