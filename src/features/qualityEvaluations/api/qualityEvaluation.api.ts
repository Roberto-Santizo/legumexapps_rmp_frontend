import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { qualityContextSchema } from "../schema/qualityEvaluation.schema"
import type { QualityFormInput } from "../schema/qualityEvaluation.schema"
import { z } from "zod"

export async function getQualityContext(id: number, editing = false) {
    try {
        const { data } = await api.get(`/quality-evaluations/${id}${editing ? "/edit" : ""}`)
        return qualityContextSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function saveQualityEvaluation(id: number, values: QualityFormInput, configurationVersion: string,
    expectedVersion: number, editing = false, reason = "") {
    try {
        const { data } = await api[editing ? "patch" : "post"](`/quality-evaluations/${id}`, {
            harvestDocNumber: values.harvestDocNumber, sampleUnits: values.sampleUnits, ph: values.ph, brix: values.brix, observations: values.observations,
            ...(!editing ? { inspectorSignature: values.inspectorSignature } : {}),
            configurationVersion, expectedVersion, ...(editing ? { reason: reason.trim() } : {}),
            pestInspection: values.pestInspection ?? null,
            defects: values.defects.map(({ defectId, input }) => ({ defectId, input })),
        })
        return z.object({ message: z.string(), data: z.object({ id: z.number(), percentage: z.number(), validPounds: z.number() }) }).parse(data)
    } catch (error) { manejarErrorApi(error) }
}
