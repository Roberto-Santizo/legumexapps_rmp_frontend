export function EditNotice({ count, override }: {
    count: number; override: boolean
}) {
    return <div className="rounded-xl border border-aviso-bd bg-aviso-bg p-4">
        <p className="mb-3 text-sm text-aviso-fg" role="status">
            {override ? `Edición excepcional autorizada. Este apartado tiene ${count} correcciones registradas.`
                : `Has utilizado ${count} de 2 correcciones en este apartado. Guardar una corrección consume una oportunidad para todo el equipo.`}
            {" "}Los cambios quedarán registrados en el historial. Las firmas actuales se conservan si no dibujas una nueva.
        </p>
        <p className="text-xs text-aviso-fg">Al guardar, deberás explicar el motivo en una ventana de confirmación con al menos siete palabras.</p>
    </div>
}
