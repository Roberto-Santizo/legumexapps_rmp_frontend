import { z } from "zod"
const group = z.object({
    id: z.number(), name: z.string(), evaluations: z.number(), comparable: z.number(), approved: z.number(),
    approvalRate: z.number().nullable(), averageQuality: z.number().nullable(), netWeight: z.number(), payablePounds: z.number(),
})
export const dashboardSchema = z.object({ data: z.object({
    period: z.object({ startDate: z.string(), endDate: z.string(), producerId: z.number().optional(), productId: z.number().optional() }), generatedAt: z.string(),
    filterOptions: z.object({
        producers: z.array(z.object({ id: z.number(), name: z.string() })),
        products: z.array(z.object({ id: z.number(), name: z.string() })),
    }).optional(),
    summary: group.extend({ receipts: z.number(), pendingQuality: z.number(), notEvaluated: z.number(), missingThreshold: z.number() }),
    states: z.array(z.object({ status: z.string(), count: z.number() })),
    intakeProducts: z.array(z.object({ id: z.number(), name: z.string(), receipts: z.number() })),
    consignedProducts: z.array(z.object({ id: z.number(), name: z.string(), receipts: z.number().int().nonnegative() })),
    products: z.array(group), producers: z.array(group), reliableProducers: z.array(group),
    defects: z.array(z.object({ name: z.string(), observedLots: z.number(), penalizedLots: z.number(), averagePenalty: z.number() })),
    trend: z.array(group.extend({ month: z.string() })),
}) }).superRefine(({ data }, context) => {
    const summary = data.summary
    const empty = summary.receipts === 0 && summary.evaluations === 0 && summary.comparable === 0 && summary.approved === 0
        && summary.pendingQuality === 0 && summary.notEvaluated === 0 && summary.missingThreshold === 0
        && summary.netWeight === 0 && summary.payablePounds === 0 && summary.averageQuality === null && summary.approvalRate === null
        && [data.states, data.intakeProducts, data.consignedProducts, data.products, data.producers, data.reliableProducers, data.defects, data.trend].every(rows => rows.length === 0)
    if (!data.filterOptions && !empty) {
        context.addIssue({ code: "invalid_type", expected: "object", path: ["data", "filterOptions"], message: "Faltan las opciones de filtros del dashboard" })
    }
}).transform(({ data }) => ({ data: { ...data, filterOptions: data.filterOptions ?? { producers: [], products: [] } } }))
export type DashboardData = z.infer<typeof dashboardSchema>["data"]
export type DashboardQuery = DashboardData["period"]
