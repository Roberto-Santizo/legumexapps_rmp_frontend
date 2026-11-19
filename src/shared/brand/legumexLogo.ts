import { legumexEyebrowPath, legumexTaglinePath } from "./legumexLogoLettering"

// Shared vector geometry for the HTML and PDF versions of the brand.
export const legumexLogoPaths = [
    { tone: "peak", d: "M48 209 C119 175 190 119 269 61 Q273 57 277 61 L388 147 C413 165 435 179 459 185 C403 180 346 136 274 87 C198 139 125 189 48 209 Z" },
    { tone: "peak", d: "M384 148 L431 112 Q434 109 438 112 C481 146 521 183 560 207 C511 188 471 156 435 132 L400 155 Z" },
    { tone: "field", d: "M79 227 C158 218 222 188 282 181 C315 177 346 180 371 187 C313 185 268 202 224 216 C177 232 129 236 79 227 Z" },
    { tone: "leaf", d: "M224 234 C280 204 332 193 389 195 C443 194 494 208 539 229 C482 214 431 209 385 212 C322 212 270 238 224 234 Z" },
] as const

export const legumexLogoViewBox = "48 58 512 180"
// Outlined lettering keeps the heavy geometric wordmark identical in HTML and PDF.
export const legumexWordmarkViewBox = "0 0 600 84"
export const legumexWordmarkPaths = [
    "M0 2 H21 V66 H60 V82 H0 Z",
    "M70 2 H132 V18 H91 V33 H127 V49 H91 V66 H133 V82 H70 Z",
    "M220 15 L206 29 C200 22 194 18 184 18 C169 18 161 29 161 42 C161 57 171 67 185 67 C193 67 199 65 204 61 V51 H184 V36 H224 V70 C214 79 201 84 184 84 C158 84 140 66 140 42 C140 18 158 0 184 0 C199 0 211 5 220 15 Z",
    "M240 2 H261 V48 C261 61 267 67 278 67 C289 67 295 61 295 48 V2 H316 V49 C316 72 302 84 278 84 C254 84 240 72 240 49 Z",
    "M332 2 H352 L379 41 L406 2 H426 V82 H405 V35 L380 69 H377 L353 35 V82 H332 Z",
    "M441 2 H502 V18 H462 V33 H497 V49 H462 V66 H503 V82 H441 Z",
    "M513 2 H537 L555 28 L573 2 H597 L567 41 L600 82 H575 L555 54 L535 82 H510 L543 41 Z",
] as const
export const legumexDividerLeaf = "M282 35 C287 15 299 8 318 3 C318 24 307 36 289 35 C294 26 302 19 309 13 C298 20 289 29 282 42 Z"
export const legumexTagline = "Growing Quality. Delivering Trust."
export const legumexPdfColors = { peak: "#00552e", field: "#2f8427", leaf: "#70b510", line: "#459b18", ink: "#00552e" }

export const legumexArtworkViewBox = "0 0 600 426"
export const legumexCompactViewBox = "0 0 600 329"
export const legumexArtworkPaths = [
    ...legumexLogoPaths.map(path => ({ ...path, transform: "matrix(0.99609375 0 0 0.99609375 -2.8125 -57.7734375)", tagline: false })),
    { d: legumexEyebrowPath, tone: "ink", transform: undefined, tagline: false },
    ...legumexWordmarkPaths.map(d => ({ d, tone: "ink" as const, transform: "translate(0 244.7)", tagline: false })),
    { d: "M20 358.2 H273 V361.2 H20 Z M328 358.2 H580 V361.2 H328 Z", tone: "line", transform: undefined, tagline: true },
    { d: legumexDividerLeaf, tone: "line", transform: "translate(0 337.7)", tagline: true },
    { d: legumexTaglinePath, tone: "ink", transform: undefined, tagline: true },
] satisfies { d: string; tone: keyof typeof legumexPdfColors; transform: string | undefined; tagline: boolean }[]
