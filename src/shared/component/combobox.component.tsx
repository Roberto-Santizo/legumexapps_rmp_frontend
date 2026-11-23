import { formControlClassName } from "@/shared/component/formControl.styles"
import { aplicarMayusculas } from "@/shared/validacion/aplicarMayusculas"
import { quitarTildes } from "@/shared/utils/sinTildes"
import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { useFieldAccessibility } from "./formField.context"
import { ChevronDown, Check, Search, X } from "lucide-react"

export type ComboboxOption = {
    value: number
    label: string
    description?: string
    searchTerms?: string[]
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
    /** Se conserva por compatibilidad: la búsqueda siempre ignora tildes. */
    ignoreAccents?: boolean
}

const MOBILE_QUERY = "(max-width: 639px)"
const DROPDOWN_HEIGHT = 340

function normalize(value: string): string {
    return quitarTildes(value.toUpperCase()).replace(/\s+/g, " ").trim()
}

// Cada palabra escrita debe aparecer en la opción, en cualquier orden:
// "SOFIA LINDA" encuentra "LINDA SOFIA 2" y "BROCOLI AVENGER" busca también en la variedad.
function matches(option: ComboboxOption, terms: string[]): boolean {
    if (!terms.length) return true
    const haystack = normalize([option.label, option.description ?? "", ...(option.searchTerms ?? [])].join(" "))
    return terms.every(term => haystack.includes(term))
}

// Resalta las palabras buscadas dentro del texto mostrado.
function highlight(text: string, terms: string[]): ReactNode {
    if (!terms.length) return text
    const normalized = normalize(text)
    // quitarTildes conserva la longitud de cada letra, así que los índices coinciden con el texto en mayúsculas.
    const source = text.toUpperCase().length === normalized.length ? text : null
    if (!source) return text
    const marks = new Array<boolean>(text.length).fill(false)
    for (const term of terms) {
        let index = normalized.indexOf(term)
        while (index !== -1) {
            for (let i = index; i < index + term.length; i++) marks[i] = true
            index = normalized.indexOf(term, index + term.length)
        }
    }
    const parts: ReactNode[] = []
    let start = 0
    for (let i = 1; i <= text.length; i++) {
        if (i === text.length || marks[i] !== marks[start]) {
            const chunk = text.slice(start, i)
            parts.push(marks[start] ? <mark key={start} className="rounded-sm bg-primary/25 px-0.5 text-dark">{chunk}</mark> : <Fragment key={start}>{chunk}</Fragment>)
            start = i
        }
    }
    return parts
}

function useIsMobile(): boolean {
    const [mobile, setMobile] = useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(MOBILE_QUERY).matches)
    useEffect(() => {
        if (typeof window.matchMedia !== "function") return
        const query = window.matchMedia(MOBILE_QUERY)
        const update = () => setMobile(query.matches)
        query.addEventListener("change", update)
        return () => query.removeEventListener("change", update)
    }, [])
    return mobile
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
}: ComboboxProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)
    const [openUpward, setOpenUpward] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const listId = useId()
    const optionId = useId()
    const accessibility = useFieldAccessibility(hasError)
    const mobile = useIsMobile()

    const selectedOption = useMemo(() => options.find(option => option.value === value) ?? null, [options, value])
    const terms = useMemo(() => normalize(search).split(" ").filter(Boolean), [search])
    const filteredOptions = useMemo(() => options.filter(option => matches(option, terms)), [options, terms])

    function openList(initialSearch = "") {
        if (disabled) return
        const rect = triggerRef.current?.getBoundingClientRect()
        if (rect) {
            const below = window.innerHeight - rect.bottom
            setOpenUpward(below < DROPDOWN_HEIGHT && rect.top > below)
        }
        setSearch(initialSearch)
        const selectedIndex = initialSearch ? 0 : Math.max(0, options.findIndex(option => option.value === value))
        setActiveIndex(selectedIndex)
        setOpen(true)
    }

    function closeList(returnFocus = true) {
        setOpen(false)
        setSearch("")
        if (returnFocus) triggerRef.current?.focus()
    }

    // Cerrar al tocar fuera (solo en escritorio; en celular la hoja ocupa la pantalla).
    useEffect(() => {
        if (!open || mobile) return
        function handlePointerOutside(event: MouseEvent | TouchEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) closeList(false)
        }
        document.addEventListener("mousedown", handlePointerOutside)
        document.addEventListener("touchstart", handlePointerOutside, { passive: true })
        return () => {
            document.removeEventListener("mousedown", handlePointerOutside)
            document.removeEventListener("touchstart", handlePointerOutside)
        }
    }, [open, mobile])

    // En celular, bloquear el desplazamiento de la página mientras la hoja está abierta.
    useEffect(() => {
        if (!open || !mobile) return
        const previous = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = previous }
    }, [open, mobile])

    useEffect(() => {
        if (open) searchRef.current?.focus()
    }, [open])

    useEffect(() => { setActiveIndex(0) }, [search])

    // Mantener visible la opción activa al usar el teclado.
    useLayoutEffect(() => {
        if (!open) return
        listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" })
    }, [activeIndex, open])

    function handleSelect(option: ComboboxOption) {
        onChange(option.value)
        closeList()
    }

    function handleClear(event: React.MouseEvent) {
        event.stopPropagation()
        onChange(null)
        setSearch("")
        triggerRef.current?.focus()
    }

    function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
            event.preventDefault()
            openList()
            return
        }
        // Empezar a escribir sobre el campo abre la búsqueda con esa letra.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            openList(quitarTildes(event.key.toUpperCase()))
        }
    }

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const last = filteredOptions.length - 1
        switch (event.key) {
            case "ArrowDown": event.preventDefault(); setActiveIndex(index => index >= last ? 0 : index + 1); break
            case "ArrowUp": event.preventDefault(); setActiveIndex(index => index <= 0 ? last : index - 1); break
            case "PageDown": event.preventDefault(); setActiveIndex(index => Math.min(last, index + 8)); break
            case "PageUp": event.preventDefault(); setActiveIndex(index => Math.max(0, index - 8)); break
            case "Enter": {
                event.preventDefault()
                const option = filteredOptions[activeIndex]
                if (option) handleSelect(option)
                break
            }
            case "Escape": event.preventDefault(); event.stopPropagation(); closeList(); break
            case "Tab": closeList(false); break
        }
    }

    const resultsLabel = loading ? "Cargando opciones..."
        : terms.length ? `${filteredOptions.length} de ${options.length} resultados` : `${options.length} opciones`

    const panel = (
        <div
            className={mobile
                ? "fixed inset-0 z-50 flex flex-col bg-surface"
                : `absolute z-30 w-full overflow-hidden rounded-[10px] border-[1.5px] border-border-light bg-surface shadow-card ${openUpward ? "bottom-full mb-1.5" : "mt-1.5"}`}
            role={mobile ? "dialog" : undefined}
            aria-modal={mobile ? true : undefined}
            aria-label={mobile ? placeholder : undefined}
        >
            {mobile && <div className="flex items-center justify-between gap-3 border-b border-border-light px-4 py-3">
                <p className="truncate text-base font-semibold text-dark">{placeholder}</p>
                <button type="button" onClick={() => closeList()} aria-label="Cerrar búsqueda"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <X size={20} aria-hidden="true" />
                </button>
            </div>}
            <div className="border-b border-border-light p-2">
                <div className="relative">
                    <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                        ref={searchRef}
                        role="combobox"
                        aria-label="Buscar opciones"
                        aria-autocomplete="list"
                        aria-expanded
                        aria-controls={listId}
                        aria-activedescendant={filteredOptions[activeIndex] ? `${optionId}-${activeIndex}` : undefined}
                        onKeyDown={handleSearchKeyDown}
                        type="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        value={search}
                        onChange={event => {
                            aplicarMayusculas(event)
                            setSearch(event.target.value)
                        }}
                        placeholder="Escribe para buscar..."
                        className={`w-full rounded-[8px] border-[1.5px] border-border-light pl-9 pr-9 text-dark focus:border-dark focus:outline-none ${mobile ? "h-12 text-base" : "h-10 text-sm"}`}
                    />
                    {search && <button type="button" aria-label="Borrar búsqueda" onClick={() => { setSearch(""); searchRef.current?.focus() }}
                        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary hover:bg-bg-primary hover:text-dark">
                        <X size={14} aria-hidden="true" />
                    </button>}
                </div>
                <p aria-live="polite" className="mt-1.5 px-1 text-xs text-text-tertiary">{resultsLabel}</p>
            </div>
            <ul ref={listRef} id={listId} role="listbox" aria-label="Opciones disponibles"
                className={mobile ? "flex-1 overflow-y-auto overscroll-contain py-1" : "max-h-64 overflow-y-auto overscroll-contain py-1"}>
                {!loading && filteredOptions.length === 0 && (
                    <li className="px-4 py-3 text-sm text-text-tertiary">{emptyMessage}</li>
                )}
                {filteredOptions.map((option, index) => {
                    const selected = option.value === value
                    const active = index === activeIndex
                    return (
                        <li
                            key={option.value}
                            id={`${optionId}-${index}`}
                            data-index={index}
                            role="option"
                            aria-selected={selected}
                            onMouseMove={() => { if (!active) setActiveIndex(index) }}
                            // mousedown evita que el campo de búsqueda pierda el foco antes de seleccionar.
                            onMouseDown={event => event.preventDefault()}
                            onClick={() => handleSelect(option)}
                            className={`flex cursor-pointer items-center justify-between gap-3 px-4 text-left text-dark ${mobile ? "min-h-14 py-3 text-base" : "min-h-11 py-2.5 text-sm"} ${active ? "bg-primary/10" : ""} ${selected ? "font-semibold" : ""}`}
                        >
                            <span className="min-w-0">
                                <span className="block break-words">{highlight(option.label, terms)}</span>
                                {option.description && <span className="mt-0.5 block break-words text-xs font-normal text-text-tertiary">{highlight(option.description, terms)}</span>}
                            </span>
                            {selected && <Check size={18} className="shrink-0 text-primary" aria-hidden="true" />}
                        </li>
                    )
                })}
            </ul>
        </div>
    )

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
                onKeyDown={handleTriggerKeyDown}
                onClick={() => (open ? closeList() : openList())}
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
                    {selectedOption && !disabled && <span className="w-8" />}
                    <ChevronDown size={18} className={`text-text-tertiary transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
                </span>
            </button>
            {selectedOption && !disabled && <button type="button" onClick={handleClear} aria-label={`Limpiar selección: ${selectedOption.label}`}
                className="absolute right-9 top-6 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary hover:bg-bg-primary hover:text-dark"><X size={15} aria-hidden="true" /></button>}

            {open && !disabled && panel}
        </div>
    )
}
