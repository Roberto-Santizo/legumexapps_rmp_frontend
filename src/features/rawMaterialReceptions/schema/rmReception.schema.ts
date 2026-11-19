import { isAllowedDocumentDate } from "../utils/documentDate"
import { grnNumberSchema } from "../utils/grn"
import { plantSchema } from "@/features/plants/schema/plant.schema"
import { z } from "zod"

import { qualityDocumentSchema } from "@/features/qualityEvaluations/schema/qualityDocument.schema"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"
import { producerSchema } from "@/features/producers/schema/producer.schema"
import { fincaSchema } from "@/features/farms/schema/finca.schema"
import { carrierSchema } from "@/features/carriers/schema/carrier.schema"
import { plateSchema } from "@/features/plates/schema/plate.schema"
import { productSchema } from "@/features/products/schema/product.schema"
import { basketSchema } from "@/features/baskets/schema/basket.schema"
import { cdpSchema } from "@/features/cdps/schema/cdp.schema"

export const assignGrnFormSchema = z.object({
    grnNumber: grnNumberSchema,
}).strict()

export const ESTADOS_BOLETA = [
    "pendiente_recepcion",
    "pendiente_evaluacion_calidad",
    "pendiente_asignacion_grn",
    "cerrado",
] as const

export const ESTADO_BOLETA_LABEL: Record<(typeof ESTADOS_BOLETA)[number], string> = {
    pendiente_recepcion: "Pendiente de recepción",
    pendiente_evaluacion_calidad: "Pendiente de evaluación de calidad",
    pendiente_asignacion_grn: "Pendiente de asignación de GRN",
    cerrado: "Cerrado",
}

const fieldDataReceptionSchema = esquemaCatalogoBase.extend({
    qualityDefinedInPlant: z.boolean().optional(),
    inspectorName: z.string(),
    pilotName: z.string(),
    weight: z.number(),
    totalBaskets: z.number(),
    weightBaskets: z.number(),
    netWeight: z.number(),
    qualityPercentage: z.number().nullable(),
    validPounds: z.number().nullable(),
    cdpId: z.number().nullable(),
    cdp: cdpSchema.nullable().optional(),
    inspectorSignature: z.string(),
    driverSignature: z.string(),
    prodSignature: z.string(),
    product: productSchema,
    plate: plateSchema,
    carrier: carrierSchema,
    producer: producerSchema,
    basket: basketSchema,
})

const prodDataReceptionSchema = esquemaCatalogoBase.extend({
    receptorUserId: z.number().int().nullable().optional(),
    receptorName: z.string().nullable().optional(),
    totalBaskets: z.number(),
    weightBaskets: z.number(),
    grossWeight: z.number(),
    netWeight: z.number(),
    qualityPercentage: z.number().nullable(),
    validPounds: z.number().nullable(),
    receptorSignature: z.string(),
    basket: basketSchema,
})

export const rmReceptionSchema = esquemaCatalogoBase.extend({
    plantId: z.number().int().positive().nullable().optional(),
    plant: plantSchema.nullable().optional(),
    userId: z.number().int().positive().optional(),
    fieldEditCount: z.number().int().nonnegative().default(0),
    receptionEditCount: z.number().int().nonnegative().default(0),
    qualityEditCount: z.number().int().nonnegative().default(0),
    editVersion: z.number().int().nonnegative().default(0),
    qualityControlDocs: z.array(qualityDocumentSchema).optional(),
    grn: z.string().nullable(),
    status: z.enum(ESTADOS_BOLETA),
    docDate: z.string(),
    consignment: z.boolean(),
    qualityReasons: z.array(z.string()).optional(),
    finca: fincaSchema,
    fieldDataReceptions: z.array(fieldDataReceptionSchema),
    prodDataReceptions: z.array(prodDataReceptionSchema),
})

const fieldFormBaseSchema = (editing: boolean) => z
    .object({
        docDate: z.iso.date("Ingresa una fecha válida"),
        fincaId: z.string().min(1, "Selecciona una finca"),
        carrierId: z.string().min(1, "Selecciona un transportista"),
        plateId: z.string().min(1, "Selecciona una placa"),
        producerId: z.number().nullable().refine((v) => v !== null, "Selecciona un productor"),
        productId: z.number().nullable().refine((v) => v !== null, "Selecciona un tipo de producto"),
        basketId: z.number().nullable().refine((v) => v !== null, "Selecciona un tipo de canasta"),
        cdpId: z.number().nullable().optional(),
        inspectorName: z.string().trim().min(1, "El nombre del inspector es obligatorio").max(255),
        pilotName: z.string().trim().min(1, "El nombre del piloto es obligatorio").max(255),
        weight: z.number().positive("El peso bruto debe ser mayor que cero"),
        totalBaskets: z.number().int("La cantidad de canastas debe ser un número entero").positive("La cantidad de canastas debe ser mayor que cero").max(2147483647, "La cantidad de canastas supera el rango permitido"),
        noQualityPercentage: z.boolean(),
        qualityPercentage: z.number().optional(),
        inspectorSignature: z.string().nullable().refine((v) => editing || !!v, "La firma del inspector es obligatoria"),
        driverSignature: z.string().nullable().refine((v) => editing || !!v?.trim(), "La firma del piloto es obligatoria"),
        prodSignature: z.string().nullable().refine((v) => editing || !!v, "La firma del productor es obligatoria"),
    })
    .superRefine((data, ctx) => {
        if (data.noQualityPercentage) return

        if (data.qualityPercentage === undefined || Number.isNaN(data.qualityPercentage)) {
            ctx.addIssue({
                code: "custom",
                path: ["qualityPercentage"],
                message: "Ingresa el porcentaje de calidad o marca \"Sin porcentaje de calidad\"",
            })
        } else if (data.qualityPercentage < 1 || data.qualityPercentage > 99.99) {
            ctx.addIssue({
                code: "custom",
                path: ["qualityPercentage"],
                message: "Debe ser mayor a 0 y menor a 100",
            })
        }
    })

export function createBoletaFormSchema(originalDate?: string) {
    return fieldFormBaseSchema(originalDate !== undefined).superRefine((data, ctx) => {
        if (data.docDate !== originalDate && !isAllowedDocumentDate(data.docDate)) ctx.addIssue({ code: "custom", path: ["docDate"], message: "La fecha de la boleta solo puede ser hoy o ayer (Guatemala)." })
    })
}
export const boletaFormSchema = createBoletaFormSchema()

export const createReceptionFormSchema = (editing = false) => z
    .object({
        productId: z.number({ error: "Selecciona un producto" }).nullable().refine((v) => v !== null, "Selecciona un producto"),
        totalBaskets: z.number({ error: "Ingresa una cantidad de canastas válida" }).int("La cantidad de canastas debe ser un número entero").positive("La cantidad de canastas debe ser mayor que cero").max(2147483647, "La cantidad de canastas supera el rango permitido"),
        basketId: z.number({ error: "Selecciona un tipo de canasta" }).nullable().refine((v) => v !== null, "Selecciona un tipo de canasta"),
        grossWeight: z.number({ error: "Ingresa un peso bruto válido" }).positive("El peso bruto debe ser mayor que cero"),
        receptorSignature: z.string({ error: "La firma del receptor es obligatoria" }).nullable().refine((v) => editing || !!v?.trim(), "La firma del receptor es obligatoria"),
    })

export const receptionFormSchema = createReceptionFormSchema()

export type RmReception = z.infer<typeof rmReceptionSchema>
export type BoletaFormInput = z.infer<typeof boletaFormSchema>
export type ReceptionFormInput = z.infer<typeof receptionFormSchema>

export type CompleteReceptionPayload = {
    productId: number
    basketId: number
    totalBaskets: number
    grossWeight: number
    receptorSignature: string
}

export type CreateRmReceptionPayload = {
    docDate: string
    fincaId: number
    carrierId: number
    plateId: number
    producerId: number
    productId: number
    basketId: number
    cdpId?: number
    inspectorName: string
    pilotName: string
    weight: number
    totalBaskets: number
    qualityPercentage?: number
    inspectorSignature: string
    driverSignature: string
    prodSignature: string
}

export type EditMetadata = { reason: string; expectedVersion: number }
export type EditFieldPayload = Omit<CreateRmReceptionPayload, "cdpId" | "qualityPercentage" | "inspectorSignature" | "driverSignature" | "prodSignature"> & EditMetadata & {
    cdpId: number | null; qualityPercentage: number | null
}
export type EditReceptionPayload = Omit<CompleteReceptionPayload, "receptorSignature"> & EditMetadata
