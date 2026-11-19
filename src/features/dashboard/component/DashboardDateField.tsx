import { DateInput } from "@/shared/component/dateInput.component"
import type { DateInputProps } from "@/shared/component/dateInput.component"

export function DashboardDateField({ label, error, id, ...props }: DateInputProps & { id: string; label: string; error?: string }) {
    return <div className="dashboard-date-field">
        <label htmlFor={id}>{label}</label>
        <DateInput {...props} id={id} required hasError={!!error} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />
        {error && <p id={`${id}-error`} role="alert">{error}</p>}
    </div>
}
