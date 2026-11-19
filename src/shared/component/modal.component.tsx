import { useEffect, useId, useRef } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

export function Modal({ title, onClose, children, closeDisabled = false }: { title: string; onClose: () => void; children: ReactNode; closeDisabled?: boolean }) {
    const dialog = useRef<HTMLDialogElement>(null)
    const titleId = useId()
    useEffect(() => {
        const element = dialog.current!
        const previousOverflow = document.body.style.overflow
        element.showModal()
        element.querySelector<HTMLElement>("input, textarea, select")?.focus()
        document.body.style.overflow = "hidden"
        return () => { element.close(); document.body.style.overflow = previousOverflow }
    }, [])
    return createPortal(
        <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!closeDisabled) onClose() }}
            className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border-light bg-surface p-0 text-dark shadow-2xl backdrop:bg-slate-950/60">
            <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 id={titleId} className="text-lg font-bold sm:text-xl">{title}</h2>
                    <button type="button" aria-label="Cerrar ventana" disabled={closeDisabled} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"><X size={20} aria-hidden="true" /></button>
                </div>
                {children}
            </div>
        </dialog>, document.body,
    )
}
