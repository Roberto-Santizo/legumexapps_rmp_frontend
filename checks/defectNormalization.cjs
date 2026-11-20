const { test } = require("node:test"), assert = require("node:assert/strict"), React = require("react")
const { createSourceLoader } = require("./sourceLoader.cjs")

function harness({ initial = { name: "", tolerancePercentage: 0, activo: true }, names = [], failed = false, manage = true } = {}) {
    const state = [], values = { ...initial }, saved = [], requests = [], invalidations = []
    let cursor = 0, mutationCursor = 0, errors = {}
    let data = { data: [
        { id: 1, name: "PUDRICIÓN", activo: true, evaluationKind: "percentage", aliases: [] },
        { id: 2, name: "DAÑO MECÁNICO", activo: true, evaluationKind: "percentage", aliases: [{ name: "DAÑOI MECANICO", normalizedName: "DAÑOI MECANICO" }] },
    ] }
    function Controller() {}
    const load = createSourceLoader({ mocks: {
        react: { ...React, useEffect() {}, useState: initial => { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = value }] } },
        "@/shared/api/api": {},
        "@/features/authentication/hook/useAuthentication": { useAuthentication: () => ({ user: { permissions: manage ? ["products:manageDefects"] : ["products:edit"] } }) },
        "react-hook-form": { Controller, useForm: () => ({
            control: {}, register: name => ({ name }), watch: key => values[key],
            handleSubmit: fn => event => { event?.preventDefault?.(); return fn({ ...values }) },
            setValue: (key, value) => { values[key] = value },
            setError: (key, error) => { errors[key] = error }, clearErrors: () => { errors = {} },
            reset: next => { for (const key of Object.keys(values)) delete values[key]; Object.assign(values, next) }, formState: { errors },
        }) },
        "@tanstack/react-query": {
            useQuery: () => ({ data, isLoading: false, isError: failed, error: failed ? new Error("No se pudo cargar") : null }),
            useQueryClient: () => ({ setQueryData: (_key, update) => { data = update(data) }, invalidateQueries: options => invalidations.push(options) }),
            useMutation: options => {
                const index = mutationCursor++
                return { isPending: false, reset() {}, mutate: payload => {
                    requests.push({ operation: index === 0 ? "create" : "update", payload })
                    options.onSuccess({ message: "Guardado", data: { id: payload.id ?? 3, name: payload.name, activo: payload.activo ?? true, evaluationKind: payload.evaluationKind, aliases: [] } })
                } }
            },
        },
    } })
    const { ProductDefectModal } = load("@/features/products/component/ProductDefectModal")
    const render = () => { cursor = 0; mutationCursor = 0; return ProductDefectModal({ initial, names, editing: Boolean(initial.id), canAddAnother: true, onSave: (...args) => saved.push(args), onClose() {} }) }
    function find(node, predicate) {
        if (!node || typeof node !== "object") return
        if (predicate(node)) return node
        for (const child of React.Children.toArray(node.props?.children)) { const result = find(child, predicate); if (result) return result }
    }
    function text(node) {
        if (typeof node === "string" || typeof node === "number") return String(node)
        if (!node || typeof node !== "object") return ""
        return React.Children.toArray(node.props?.children).map(text).join("")
    }
    return { render, find, saved, requests, values, invalidations, errors: () => errors,
        selector: tree => find(tree, node => node.type === Controller).props.render({ field: { value: values.defectCatalogId } }),
        button: (tree, label) => find(tree, node => ["button", "submit"].includes(node.props?.type) && text(node).trim() === label),
    }
}

test("product form requires a catalog identity and preserves independent percentages", () => {
    const { productFormSchema } = createSourceLoader()("@/features/products/schema/product.schema")
    const base = { name: "PRODUCTO", varietyProductId: "1", acceptedPercentage: 70 }
    const defect = { name: "PUDRICIÓN", defectCatalogId: 1, tolerancePercentage: 2, activo: true }
    assert(productFormSchema.safeParse({ ...base, defects: [defect] }).success)
    assert(productFormSchema.safeParse({ ...base, defects: [{ ...defect, tolerancePercentage: 5 }] }).success)
    assert(!productFormSchema.safeParse({ ...base, defects: [{ ...defect, defectCatalogId: null }] }).success)
    assert(!productFormSchema.safeParse({ ...base, defects: [defect, { ...defect, name: "OTRO" }] }).success)
})

test("search normalization distinguishes Ñ while ignoring vowel accents and spaces", () => {
    const { normalizeDefectName } = createSourceLoader()("@/features/products/utils/defectName")
    assert.equal(normalizeDefectName(" daN\u0303o   mecánico "), "DAÑO MECANICO")
    assert.notEqual(normalizeDefectName("CAÑA"), normalizeDefectName("CANA"))
})

test("users without catalog management can select defects but cannot create or rename them", () => {
    const h = harness({ manage: false })
    const tree = h.render()
    assert(!h.button(tree, "Crear nuevo defecto"))
    assert(!h.button(tree, "Editar nombre compartido"))
    assert.equal(h.selector(tree).props.disabled, false)
})

test("a reviewed spelling alias selects the official defect without creating another catalog row", () => {
    const h = harness()
    h.button(h.render(), "Crear nuevo defecto").props.onClick()
    h.find(h.render(), node => node.props?.id === "modal-new-defect").props.onChange({ target: { value: "DAÑOI MECANICO" } })
    h.find(h.render(), node => node.type === "form").props.onSubmit({ preventDefault() {}, stopPropagation() {} })
    assert.deepEqual(h.requests, [])
    assert.equal(h.values.defectCatalogId, 2)
    assert.equal(h.values.name, "DAÑO MECÁNICO")
    assert(h.selector(h.render()).props.options.some(entry => entry.searchTerms.includes("DAÑOI MECANICO")))
})

test("catalog creation only asks for the name and leaves pest counting to the product", () => {
    const h = harness({ initial: { name: "", tolerancePercentage: 5, activo: true } })
    h.button(h.render(), "Crear nuevo defecto").props.onClick()
    assert(!h.find(h.render(), node => node.props?.id === "modal-catalog-kind"))
    assert(!h.find(h.render(), node => node.props?.id === "modal-defect-tolerance"), "Creating a catalog name does not mix in the product tolerance form")
    h.find(h.render(), node => node.props?.id === "modal-new-defect").props.onChange({ target: { value: "MANCHAS" } })
    h.find(h.render(), node => node.type === "form").props.onSubmit({ preventDefault() {}, stopPropagation() {} })
    assert.deepEqual(h.requests[0], { operation: "create", payload: { name: "MANCHAS" } })
    assert.equal(h.values.tolerancePercentage, 5)
    assert(!Object.hasOwn(h.values, "evaluationKind"))
    assert(h.find(h.render(), node => node.props?.id === "modal-defect-tolerance"), "After creation the user returns to the product tolerance step")
    assert.equal(h.saved.length, 0, "Creating a name does not silently add it to the product")
})

test("catalog rename and availability are saved independently from product tolerance", () => {
    const h = harness({ initial: { id: 42, defectCatalogId: 2, name: "DAÑO MECÁNICO", tolerancePercentage: 5, activo: true } })
    h.button(h.render(), "Editar nombre compartido").props.onClick()
    h.find(h.render(), node => node.props?.id === "modal-new-defect").props.onChange({ target: { value: "DAÑO MECÁNICO SUPERFICIAL" } })
    h.find(h.render(), node => node.props?.id === "modal-catalog-active").props.onChange({ target: { checked: false } })
    h.find(h.render(), node => node.type === "form").props.onSubmit({ preventDefault() {}, stopPropagation() {} })
    assert.equal(h.requests[0].operation, "update")
    assert.equal(h.requests[0].payload.activo, false)
    assert(!Object.hasOwn(h.requests[0].payload, "tolerancePercentage"))
    assert(!Object.hasOwn(h.requests[0].payload, "evaluationKind"))
    assert.equal(h.values.tolerancePercentage, 5)
    assert.equal(h.values.name, "DAÑO MECÁNICO SUPERFICIAL")
    assert.equal(h.invalidations.find(options => options.queryKey[0] === "products").refetchType, "none", "Catalog changes must not reset unsaved fields in the parent product form")
})

test("selection preserves association IDs and clearing or failed catalog loading prevents invalid saves", async () => {
    const h = harness({ initial: { id: 42, defectCatalogId: 1, name: "PUDRICIÓN", tolerancePercentage: 5, activo: true } })
    h.find(h.render(), node => node.type === "form").props.onSubmit({ stopPropagation() {}, preventDefault() {} })
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(h.saved[0][0].id, 42)
    assert.equal(h.saved[0][0].tolerancePercentage, 5)
    h.selector(h.render()).props.onChange(null)
    h.find(h.render(), node => node.type === "form").props.onSubmit({ stopPropagation() {}, preventDefault() {} })
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(h.saved.length, 1)
    assert.equal(h.values.defectCatalogId, null)
    const failed = harness({ failed: true })
    assert.equal(failed.button(failed.render(), "Agregar al producto").props.disabled, true)
})

test("returning from name creation preserves the selected defect and product tolerance", () => {
    const h = harness({ initial: { id: 42, defectCatalogId: 1, name: "PUDRICIÓN", tolerancePercentage: 5, activo: true } })
    h.button(h.render(), "Crear nuevo defecto").props.onClick()
    h.find(h.render(), node => node.props?.id === "modal-new-defect").props.onChange({ target: { value: "OTRO DEFECTO" } })
    assert(!h.find(h.render(), node => node.props?.id === "modal-defect-catalog"))
    h.button(h.render(), "Volver").props.onClick()
    assert.equal(h.selector(h.render()).props.value, 1)
    assert.equal(h.values.tolerancePercentage, 5)
    assert.equal(h.requests.length, 0)
})

test("name validation appears next to the name field, and adding another remains an explicit choice", async () => {
    const h = harness()
    h.button(h.render(), "Crear nuevo defecto").props.onClick()
    h.find(h.render(), node => node.type === "form").props.onSubmit({ preventDefault() {}, stopPropagation() {} })
    assert(h.find(h.render(), node => node.props?.htmlFor === "modal-new-defect").props.error)
    assert.equal(h.requests.length, 0)
    h.button(h.render(), "Volver").props.onClick()
    h.selector(h.render()).props.onChange(1)
    h.find(h.render(), node => node.props?.id === "modal-add-another").props.onChange({ target: { checked: true } })
    h.find(h.render(), node => node.type === "form").props.onSubmit({ preventDefault() {}, stopPropagation() {} })
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(h.saved[0][1], true)
    assert.equal(h.values.defectCatalogId, null)
})

test("product API sends identities and percentages without copying catalog names or classification", async () => {
    let posted
    const load = createSourceLoader({ mocks: { "@/shared/api/api": { post: async (_url, payload) => {
        posted = payload
        return { data: { message: "Creado", data: { id: 1, activo: true, name: "PRODUCTO", varietyProductId: 1, acceptedPercentage: 70, createdAt: "2026-11-20T12:00:00Z", updatedAt: "2026-11-20T12:00:00Z" } } }
    } } } })
    const { createProductApi } = load("@/features/products/api/product.api")
    await createProductApi({ name: "PRODUCTO", varietyProductId: 1, acceptedPercentage: 70,
        defects: [{ name: "NOMBRE", defectCatalogId: 2, tolerancePercentage: 5, activo: true, evaluationKind: "percentage" }] })
    assert.equal(posted.defects[0].defectCatalogId, 2)
    assert.equal(posted.defects[0].tolerancePercentage, 5)
    assert(!Object.hasOwn(posted.defects[0], "name"))
    assert(!Object.hasOwn(posted.defects[0], "evaluationKind"))
})
