import { z } from "zod"
import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { plantSchema } from "../schema/plant.schema"

const plantsResponse = z.object({ data: z.array(plantSchema) })
const currentPlantResponse = z.object({ data: plantSchema.nullable() })

export async function listPlantsApi() {
    try { return plantsResponse.parse((await api.get("/plants")).data) }
    catch (error) { manejarErrorApi(error) }
}

export async function getCurrentPlantApi() {
    try { return currentPlantResponse.parse((await api.get("/plants/current")).data) }
    catch (error) { manejarErrorApi(error) }
}
