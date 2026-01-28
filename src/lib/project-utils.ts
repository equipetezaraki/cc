import { addDays } from "date-fns"
import { addBusinessDays } from "./date-utils"

export type ProjectDeadlineRule = {
    projectType: string
    funnelCount: number
    startDate: Date
}

export function calculateProjectGoLiveDate({ projectType, funnelCount, startDate }: ProjectDeadlineRule): Date {
    let goLiveDate = new Date(startDate)

    if (projectType === 'Tezaraki Essential') {
        goLiveDate = addDays(startDate, 30)
    } else if (projectType === 'Tezaraki Pro') {
        // 30 days calendar + 5 business days per extra funnel
        const baseDate = addDays(startDate, 30)
        const extraFunnels = Math.max(0, funnelCount - 1)
        const extraBusinessDays = extraFunnels * 5

        if (extraBusinessDays > 0) {
            goLiveDate = addBusinessDays(baseDate, extraBusinessDays)
        } else {
            goLiveDate = baseDate
        }
    } else if (projectType === 'Tezaraki Private') {
        goLiveDate = addDays(startDate, 90)
    } else {
        // Fallback for old types if any
        const daysToAdd = projectType === 'Corrente' ? 30 : 60
        goLiveDate = addDays(startDate, daysToAdd)
    }

    return goLiveDate
}
