// Regla de la base de datos: ningún texto se guarda con tilde ni diéresis.
// Se conserva la Ñ (es una letra distinta, no una tilde).
const MARCAS = /[̀-ͯ]/g

export function quitarTildes(value: string): string {
    return value.normalize("NFD")
        .replace(/Ñ/g, "Ñ").replace(/ñ/g, "ñ")
        .replace(MARCAS, "")
        .normalize("NFC")
}
