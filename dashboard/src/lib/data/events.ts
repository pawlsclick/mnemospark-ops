import { getDashboardEvents, getEventRatePerMinute, getLambdaErrorSummary } from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'
import type { DashboardEvent } from '@/lib/types/events'

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

export type EventFilters = {
  wallet?: string
  quoteId?: string
  requestId?: string
  route?: string
  lambdaName?: string
  status?: 'success' | 'error' | 'pending' | 'info'
}

export function applyEventFilters(events: DashboardEvent[], filters: EventFilters): DashboardEvent[] {
  return events.filter((event) => {
    if (filters.wallet && event.walletAddress !== filters.wallet) return false
    if (filters.quoteId && event.quoteId !== filters.quoteId) return false
    if (filters.requestId && event.requestId !== filters.requestId) return false
    if (filters.route && event.route !== filters.route) return false
    if (filters.lambdaName && event.lambdaName !== filters.lambdaName) return false
    if (filters.status && event.status !== filters.status) return false
    return true
  })
}
