import { getDashboardEvents, getEventRatePerMinute, getLambdaErrorSummary } from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'

export async function getEventsPageData(input?: TimeRangeInput) {
  const [events, eventRate, lambdaErrors] = await Promise.all([
    getDashboardEvents(input),
    getEventRatePerMinute(input),
    getLambdaErrorSummary(input),
  ])

  return {
    events,
    eventRate,
    lambdaErrors,
  }
}
