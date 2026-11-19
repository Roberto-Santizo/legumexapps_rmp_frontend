import { buttonClassName } from "@/shared/component/button.styles"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

type TableContainerProps = {
    children: ReactNode
    className?: string
}

type TableHeaderProps = {
    title: string
    linkTo?: string
    linkText?: string
    children?: ReactNode
}

type TableProps = {
    children: ReactNode
    className?: string
}

type TableHeadProps = {
    children: ReactNode
}

type TableBodyProps = {
    children: ReactNode
}

type TableRowProps = {
    children: ReactNode
    className?: string
    onClick?: () => void
}

type TableCellProps = {
    children: ReactNode
    align?: "left" | "center" | "right"
    className?: string
}

type TableEmptyProps = {
    message?: string
}

type TableActionsProps = {
    children: ReactNode
    align?: "left" | "center" | "right"
}

function alignClassName(align: "left" | "center" | "right") {
    return align === "center" ? "table-cell-center" : align === "right" ? "table-cell-right" : ""
}

export function TableContainer({ children, className = "" }: TableContainerProps) {
    return <div className={`table-container ${className}`}>{children}</div>
}

export function TableHeader({ title, linkTo, linkText = "Crear", children }: TableHeaderProps) {
    return (
        <div className="table-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="table-title">{title}</h2>
            {children
                ? children
                : linkTo && (
                      <Link to={linkTo} className={buttonClassName("primary", "whitespace-nowrap")}>
                          {linkText}
                      </Link>
                  )}
        </div>
    )
}

export function Table({ children, className = "" }: TableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-border-light">
            <table className={`table ${className}`}>{children}</table>
        </div>
    )
}

export function TableHead({ children }: TableHeadProps) {
    return <thead>{children}</thead>
}

export function TableBody({ children }: TableBodyProps) {
    return <tbody>{children}</tbody>
}

export function TableRow({ children, className = "", onClick }: TableRowProps) {
    return (
        <tr className={className} onClick={onClick}>
            {children}
        </tr>
    )
}

export function Th({ children, align = "left", className = "" }: TableCellProps) {
    return <th className={`${alignClassName(align)} ${className}`}>{children}</th>
}

export function Td({ children, align = "left", className = "" }: TableCellProps) {
    return <td className={`${alignClassName(align)} ${className}`}>{children}</td>
}

export function TableEmpty({ message = "No hay datos registrados." }: TableEmptyProps) {
    return <p className="rounded-xl border border-dashed border-border-light bg-bg-primary/60 px-6 py-16 text-center text-sm text-text-tertiary">{message}</p>
}

export function TableActions({ children, align = "center" }: TableActionsProps) {
    const alignClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
    return <div className={`table-actions ${alignClass}`}>{children}</div>
}
