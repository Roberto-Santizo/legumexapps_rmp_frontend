import { formControlClassName } from "@/shared/component/formControl.styles"
import { aplicarMayusculas } from "@/shared/validacion/aplicarMayusculas"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { useFieldAccessibility } from "./formField.context"
import { ChevronDown, Check, X } from "lucide-react"

export type ComboboxOption = {
    value: number
    label: string
    description?: string
}

type ComboboxProps = {
    id?: string
    value: number | null
    onChange: (value: number | null) => void
    options: ComboboxOption[]
    placeholder?: string
    emptyMessage?: string
    disabled?: boolean
    loading?: boolean
    hasError?: boolean
    ignoreAccents?: boolean
}

export function Combobox({
    id,
    value,
    onChange,
    options,
    placeholder = "Buscar...",
    emptyMessage = "Sin resultados",
    disabled = false,
    loading = false,
    hasError = false,
    ignoreAccents = false,
}: ComboboxProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const listId = useId()
    const accessibility = useFieldAccessibility(hasError)

    const selectedOption = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value])

    const filteredOptions = useMemo(() => {
        const normalize = (value: string) => (ignoreAccents ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : value).toLowerCase()
        const term = normalize(search.trim())
        if (!term) return options
        return options.filter((option) => normalize(option.label).includes(term))
    }, [options, search, ignoreAccents])

    useEffect(() => {
        function handlePointerOutside(event: MouseEvent | TouchEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
                setSearch("")
            }
        }
        document.addEventListener("mousedown", handlePointerOutside)
        document.addEventListener("touchstart", handlePointerOutside, { passive: true })
        return () => {
            document.removeEventListener("mousedown", handlePointerOutside)
            document.removeEventListener("touchstart", handlePointerOutside)
        }
    }, [])

    function handleSelect(option: ComboboxOption) {
        onChange(option.value)
        setOpen(false)
        setSearch("")
        triggerRef.current?.focus()
    }

    function handleClear(event: React.MouseEvent) {
        event.stopPropagation()
        onChange(null)
        setSearch("")
    }

    function moveOption(event: KeyboardEvent<HTMLElement>) {
        if (event.key === "Escape") {
            event.preventDefault()
            setOpen(false)
            setSearch("")
            triggerRef.current?.focus()
            return
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
        event.preventDefault()
        if (!open) { setOpen(true); return }
        const options = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
        const selected = options.indexOf(document.activeElement as HTMLButtonElement)
        const index = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
            : event.key === "ArrowDown" ? (selected + 1) % options.length : (selected <= 0 ? options.length - 1 : selected - 1)
        options[index]?.focus()
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                id={id}
                ref={triggerRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open && !disabled}
                aria-controls={open ? listId : undefined}
                {...accessibility}
                disabled={disabled}
                onKeyDown={moveOption}
                onClick={() => setOpen((v) => !v)}
                className={formControlClassName(hasError, "flex h-12 items-center justify-between gap-2 text-left")}
            >
                <span className={selectedOption ? "truncate text-dark" : "truncate text-text-tertiary"}>
                    {selectedOption ? (
                        <>
                            {selectedOption.label}
                            {selectedOption.description && (
                                <span className="ml-1.5 text-text-tertiary">{selectedOption.description}</span>
                            )}
                        </>
                    ) : loading ? (
                        "Cargando..."
                    ) : (
                        placeholder
                    )}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                    {selectedOption && !disabled && <span className="w-6" />}
                    <ChevronDown size={18} className="text-text-tertiary" />
                </span>
            </button>
            {selectedOption && !disabled && <button type="button" onClick={handleClear} aria-label={`Limpiar selección: ${selectedOption.label}`}
                className="absolute right-10 top-6 -translate-y-1/2 rounded-full p-1 text-text-tertiary hover:bg-bg-primary hover:text-dark"><X size={14} aria-hidden="true" /></button>}

            {open && !disabled && (
                <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-[10px] border-[1.5px] border-border-light bg-surface shadow-card">
                    <div className="border-b border-border-light p-2">
                        <input
                            autoFocus
                            aria-label="Buscar opciones"
                            aria-controls={listId}
                            onKeyDown={event => { if (event.key !== "Home" && event.key !== "End") moveOption(event) }}
                            type="text"
                            value={search}
                            onChange={(event) => {
                                aplicarMayusculas(event)
                                setSearch(event.target.value)
                            }}
                            placeholder="Escribe para buscar..."
                            className="h-10 w-full rounded-[8px] border-[1.5px] border-border-light px-3 text-sm text-dark focus:outline-none focus:border-dark"
                        />
                    </div>
                    <ul id={listId} role="listbox" aria-label="Opciones disponibles" className="max-h-56 overflow-y-auto py-1">
                        {filteredOptions.length === 0 && (
                            <li className="px-4 py-3 text-sm text-text-tertiary">{emptyMessage}</li>
                        )}
                        {filteredOptions.map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={option.value === value}
                                    onKeyDown={moveOption}
                                    onClick={() => handleSelect(option)}
                                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-dark hover:bg-bg-primary"
                                >
                                    <span className="truncate">
                                        {option.label}
                                        {option.description && (
                                            <span className="ml-1.5 text-text-tertiary">{option.description}</span>
                                        )}
                                    </span>
                                    {option.value === value && <Check size={16} className="shrink-0 text-primary" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
