import type { ComboboxOption } from "@/shared/component/combobox.component"

export function includeHistoricalOption(options: ComboboxOption[], original?: ComboboxOption | null): ComboboxOption[] {
    if (!original || options.some(option => option.value === original.value)) return options
    return [{ ...original, description: [original.description, "Referencia original"].filter(Boolean).join(" · ") }, ...options]
}
