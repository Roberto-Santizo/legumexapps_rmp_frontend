import { forwardRef, useEffect, useRef } from "react"
import type { InputHTMLAttributes } from "react"
import { CalendarDays } from "lucide-react"
import { Input } from "./input.component"
import { dateInputError, formatGuatemalaDate, isIsoDate, parseGuatemalaDateInput } from "../utils/guatemalaDate"

export type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "min" | "max"> & {
    value: string
    onChange: (value: string) => void
    min?: string
    max?: string
    hasError?: boolean
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
    { value = "", onChange, min, max, readOnly, disabled, ...props }, ref
) {
    const input = useRef<HTMLInputElement | null>(null)
    const calendar = useRef<HTMLInputElement | null>(null)
    const validationError = readOnly || disabled ? "" : dateInputError(value, min, max)
    useEffect(() => {
        input.current?.setCustomValidity(validationError)
    }, [validationError])

    return <div className="relative min-w-0 w-full">
        <Input {...props} ref={element => {
            input.current = element
            if (typeof ref === "function") ref(element)
            else if (ref) ref.current = element
        }} type="text" preserveCase lang="es-GT" autoComplete="off"
            placeholder="DD/MM/AAAA" maxLength={10} pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
            className={`pr-12 ${props.className ?? ""}`} readOnly={readOnly} disabled={disabled}
            hasError={props.hasError || !!validationError} aria-invalid={props["aria-invalid"] || !!validationError || undefined}
            title={validationError || props.title}
            value={isIsoDate(value) ? formatGuatemalaDate(value) : value}
            onChange={event => {
                const next = parseGuatemalaDateInput(event.target.value)
                event.target.setCustomValidity(dateInputError(next, min, max))
                onChange(next)
            }} onBlur={event => {
                props.onBlur?.(event)
                if (!readOnly && !disabled && !event.target.validity.valid) event.target.reportValidity()
            }} />
        <button type="button" className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
            disabled={disabled || readOnly} aria-label="Seleccionar fecha en calendario" aria-controls={props.id}
            onClick={() => {
                if (calendar.current?.showPicker) calendar.current.showPicker()
                else calendar.current?.click()
            }}>
            <CalendarDays size={18} aria-hidden="true" />
        </button>
        <input ref={calendar} type="date" lang="es-GT" tabIndex={-1} aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0"
            disabled={disabled || readOnly} min={min && isIsoDate(min) ? min : undefined} max={max && isIsoDate(max) ? max : undefined}
            value={isIsoDate(value) ? value : ""} onChange={event => onChange(event.target.value)} />
    </div>
})
