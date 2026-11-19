import { legumexArtworkPaths, legumexArtworkViewBox, legumexCompactViewBox, legumexTagline } from "@/shared/brand/legumexLogo"
import "@/shared/styles/legumex-logo.css"

type LegumexLogoStackedProps = {
    showTagline?: boolean
    className?: string
    tone?: "default" | "inverse"
}

export function LegumexLogoStacked({ showTagline = true, className = "", tone = "default" }: Readonly<LegumexLogoStackedProps>) {
    return (
        <span role="img" aria-label={`Agroindustria Legumex${showTagline ? `. ${legumexTagline}` : ""}`} data-tone={tone} className={`legumex-stacked-logo ${className}`}>
            <svg className="legumex-stacked-logo-mark" viewBox={showTagline ? legumexArtworkViewBox : legumexCompactViewBox} aria-hidden="true" focusable="false">
                {legumexArtworkPaths.filter(path => showTagline || !path.tagline).map((path, index) =>
                    <g key={index} transform={path.transform}><path className={`legumex-stacked-logo-${path.tone}`} d={path.d} /></g>)}
            </svg>
        </span>
    )
}
