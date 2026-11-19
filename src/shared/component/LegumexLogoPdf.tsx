import { Svg, Path } from "@react-pdf/renderer"
import { legumexArtworkPaths, legumexArtworkViewBox, legumexPdfColors } from "@/shared/brand/legumexLogo"

export function LegumexLogoPdf() {
    return <Svg width={55} height={39.05} viewBox={legumexArtworkViewBox}>
        {legumexArtworkPaths.map((path, index) => <Path key={index} d={path.d} transform={path.transform} fill={legumexPdfColors[path.tone]} />)}
    </Svg>
}
