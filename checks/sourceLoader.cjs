const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

// Pruebas de fuentes sin iniciar Vite, red ni una sesión de usuario.
function createSourceLoader({ mocks = {} } = {}) {
    const cache = new Map(), root = path.resolve(__dirname, "../src")
    function load(filename) {
        if (filename.startsWith("@/")) filename = path.resolve(root, filename.slice(2))
        if (!fs.existsSync(filename)) filename = fs.existsSync(`${filename}.ts`) ? `${filename}.ts` : `${filename}.tsx`
        filename = path.resolve(filename)
        if (cache.has(filename)) return cache.get(filename).exports
        const module = { exports: {} }
        cache.set(filename, module)
        const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: {
            module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
        } }).outputText
        new Function("require", "module", "exports", source)(id => {
            if (Object.hasOwn(mocks, id)) return mocks[id]
            if (id.endsWith(".css")) return {}
            if (id.startsWith("@/") || id.startsWith(".")) return load(id.startsWith("@/") ? id : path.resolve(path.dirname(filename), id))
            return require(id)
        }, module, module.exports)
        return module.exports
    }
    return load
}
module.exports = { createSourceLoader }
