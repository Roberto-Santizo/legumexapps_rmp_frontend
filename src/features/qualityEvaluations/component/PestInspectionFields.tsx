import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Card } from "@/shared/component/card.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import type { QualityFormInput } from "../schema/qualityEvaluation.schema"
import { pestResultLabels } from "../schema/pestEvaluation.schema"
import type { PestRule, PestEvaluation } from "../schema/pestEvaluation.schema"
import { formatPestBasketRange } from "../utils/pestEvaluation"

type Props = { rule: PestRule; evaluation: PestEvaluation | null; register: UseFormRegister<QualityFormInput>; errors: FieldErrors<QualityFormInput>; disabled: boolean }
const countValue = (value: unknown) => value === "" || value == null ? null : Number(value)

export function PestInspectionFields({ rule, evaluation, register, errors, disabled }: Props) {
    return <Card>
        <h2 className="mb-2 text-lg font-semibold text-dark">Gusanos y áfidos</h2>
        <p className="mb-4 text-sm text-text-tertiary">Este control usa cantidades y no descuenta porcentaje de calidad.</p>
        <ol className="mb-5 list-decimal space-y-2 pl-5 text-sm text-dark">
            <li>Para {formatPestBasketRange(rule)} canastas, toma producto al azar hasta completar <strong>{rule.samplePounds} lb de muestra</strong>.</li>
            <li>Revisa toda la muestra. Cuenta los gusanos y las cabezas con áfidos; una cabeza afectada se cuenta una sola vez.</li>
            <li>Ingresa ambos conteos. Escribe cero cuando hayas revisado y no encuentres presencia.</li>
        </ol>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Cantidad de gusanos" htmlFor="pest-worms" required error={errors.pestInspection?.wormCount?.message}>
                <Input id="pest-worms" type="number" inputMode="numeric" min={0} max={2147483647} step={1} placeholder="Ingresa el conteo, incluido cero" disabled={disabled}
                    hasError={!!errors.pestInspection?.wormCount} {...register("pestInspection.wormCount", { setValueAs: countValue })} />
            </FormField>
            <FormField label="Cabezas con áfidos" htmlFor="pest-aphids" required error={errors.pestInspection?.aphidHeadsCount?.message}>
                <Input id="pest-aphids" type="number" inputMode="numeric" min={0} max={2147483647} step={1} placeholder="Ingresa el conteo, incluido cero" disabled={disabled}
                    hasError={!!errors.pestInspection?.aphidHeadsCount} {...register("pestInspection.aphidHeadsCount", { setValueAs: countValue })} />
            </FormField>
        </div>
        {evaluation?.result === "out_of_tolerance" && <div role="status" aria-live="polite" className="rounded-xl border border-error-fg p-4 text-sm text-error-fg">
            <p className="font-semibold">{pestResultLabels[evaluation.result]}</p>
            {evaluation.reasons.map(reason => <p key={reason} className="mt-2">{reason}</p>)}
        </div>}
    </Card>
}
