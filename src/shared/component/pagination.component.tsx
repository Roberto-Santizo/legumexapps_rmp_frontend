import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
    const pages: (number | "...")[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
    }

    return pages
}

export function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages < 1) return null

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border-light pt-4 sm:flex-row">
            <div className="order-2 flex items-center gap-2 text-sm sm:order-1">
                <span className="font-medium text-text-tertiary">Página</span>
                <div className="flex items-center gap-1.5 rounded-[8px] border border-primary/30 bg-primary/10 px-3.5 py-1.5">
                    <span className="font-bold text-dark">{currentPage}</span>
                    <span className="font-medium text-text-tertiary">de</span>
                    <span className="font-bold text-dark">{totalPages}</span>
                </div>
            </div>

            <div className="order-1 flex items-center gap-2 sm:order-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-border-light px-4 py-2.5 text-sm font-semibold text-dark transition hover:border-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-light"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1.5">
                    {getPageNumbers(currentPage, totalPages).map((page, index) =>
                        page === "..." ? (
                            <span key={`ellipsis-${index}`} className="select-none px-2 font-bold text-text-tertiary">
                                •••
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                className={`h-[42px] min-w-[42px] rounded-[10px] text-sm font-bold transition ${
                                    currentPage === page
                                        ? "bg-primary text-dark shadow-solid"
                                        : "border-[1.5px] border-border-light text-dark hover:border-dark"
                                }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-border-light px-4 py-2.5 text-sm font-semibold text-dark transition hover:border-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-light"
                >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    )
}
