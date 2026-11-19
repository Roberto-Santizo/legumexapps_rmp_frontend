import { useEffect, useRef, useState } from "react"
import { Eraser } from "lucide-react"

type SignaturePadProps = {
    value: string | null
    onChange: (value: string | null) => void
    disabled?: boolean
    readOnly?: boolean
    hasError?: boolean
    height?: number
}

export function SignaturePad({ value, onChange, disabled = false, readOnly = false, hasError = false, height = 160 }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const drawingRef = useRef(false)
    const emptyRef = useRef(true)
    const [isEmpty, setIsEmpty] = useState(true)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        function resize() {
            if (!canvas || !container) return
            const ratio = window.devicePixelRatio || 1
            const width = container.clientWidth
            canvas.width = width * ratio
            canvas.height = height * ratio
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            const context = canvas.getContext("2d")
            if (context) {
                context.scale(ratio, ratio)
                context.lineWidth = 2.2
                context.lineCap = "round"
                context.lineJoin = "round"
                context.strokeStyle = "#0f172a"
            }
        }

        resize()
        const observer = new ResizeObserver(resize)
        observer.observe(container)
        return () => observer.disconnect()
    }, [height, readOnly])

    function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
        if (disabled) return
        const canvas = canvasRef.current
        const context = canvas?.getContext("2d")
        if (!canvas || !context) return

        canvas.setPointerCapture(event.pointerId)
        drawingRef.current = true
        const { x, y } = getPoint(event)
        context.beginPath()
        context.moveTo(x, y)
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!drawingRef.current || disabled) return
        const context = canvasRef.current?.getContext("2d")
        if (!context) return

        const { x, y } = getPoint(event)
        context.lineTo(x, y)
        context.stroke()

        if (emptyRef.current) {
            emptyRef.current = false
            setIsEmpty(false)
        }
    }

    function handlePointerUp() {
        if (!drawingRef.current) return
        drawingRef.current = false
        const canvas = canvasRef.current
        if (canvas && !emptyRef.current) {
            onChange(canvas.toDataURL("image/png"))
        }
    }

    function handleClear() {
        const canvas = canvasRef.current
        const context = canvas?.getContext("2d")
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height)
        }
        emptyRef.current = true
        setIsEmpty(true)
        onChange(null)
    }

    if (readOnly) return <div className="rounded-[10px] border border-border-light bg-surface p-4">
        {value ? <img src={value} alt="Firma registrada" className="max-h-32 max-w-full object-contain" />
            : <p className="text-sm text-text-tertiary">Sin firma registrada.</p>}
        <p className="mt-2 text-xs text-text-tertiary">La firma original se conserva y no se puede modificar.</p>
    </div>

    return (
        <div>
            {value?.startsWith("https://") && <div className="mb-3">
                <img src={value} alt="Firma registrada" className="max-h-32 max-w-full object-contain" />
                <p className="text-xs text-text-tertiary">Firma actual. Dibuja en el recuadro para reemplazarla.</p>
            </div>}
            <div
                ref={containerRef}
                className={`overflow-hidden rounded-[10px] border-[1.5px] bg-surface ${
                    hasError ? "border-error-bd" : "border-border-light"
                } ${disabled ? "opacity-50" : ""}`}
            >
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="block w-full touch-none"
                    style={{ height }}
                />
            </div>
            <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-text-tertiary">Firma con el dedo o el mouse en el recuadro</p>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={disabled || (isEmpty && !value)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary transition hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Eraser size={14} />
                    Limpiar
                </button>
            </div>
        </div>
    )
}
