export function FieldError({ children, id }: { children?: string; id?: string }) {
    if (!children) return null
    return <p id={id} role="alert" className="mt-1.5 text-sm text-error-fg">{children}</p>
}
