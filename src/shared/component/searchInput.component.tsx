import { Search, X } from "lucide-react"
import { aplicarMayusculas } from "@/shared/validacion/aplicarMayusculas"

type SearchInputProps = {
    id?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchInput({ id, value, onChange, placeholder = "Buscar...", className = "" }: SearchInputProps) {
    return (
        <div className={`relative ${className}`}>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
                id={id}
                type="text"
                value={value}
                onChange={(event) => {
                    aplicarMayusculas(event)
                    onChange(event.target.value)
                }}
                placeholder={placeholder}
                className="h-10 w-full rounded-[10px] border-[1.5px] border-border-light bg-surface py-2 pl-9 pr-9 text-sm text-dark placeholder:text-text-tertiary focus:outline-none focus:border-dark"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-dark"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}
