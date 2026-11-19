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
    }),
    summary: group.extend({ receipts: z.number(), pendingQuality: z.number(), notEvaluated: z.number(), missingThreshold: z.number() }),
    states: z.array(z.object({ status: z.string(), count: z.number() })),
    intakeProducts: z.array(z.object({ id: z.number(), name: z.string(), receipts: z.number() })),
    consignedProducts: z.array(z.object({ id: z.number(), name: z.string(), receipts: z.number().int().nonnegative() })),
    products: z.array(group), producers: z.array(group), reliableProducers: z.array(group),
    defects: z.array(z.object({ name: z.string(), observedLots: z.number(), penalizedLots: z.number(), averagePenalty: z.number() })),
    trend: z.array(group.extend({ month: z.string() })),
}) })
export type DashboardData = z.infer<typeof dashboardSchema>["data"]
export type DashboardQuery = DashboardData["period"]
