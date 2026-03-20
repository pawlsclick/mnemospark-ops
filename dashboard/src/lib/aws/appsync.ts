import { env } from '@/lib/config'
import type { DashboardEvent } from '@/lib/types/events'

export async function fetchAppSyncLiveEvents(limit = 25): Promise<DashboardEvent[]> {
  if (!env.APPSYNC_EVENTS_ENDPOINT || !env.APPSYNC_API_KEY) {
    return []
  }

  const query = {
    query: `
      query RecentDashboardEvents($limit: Int!) {
        recentDashboardEvents(limit: $limit) {
          id
          timestamp
          eventType
          source
          status
          severity
          walletAddress
          quoteId
          requestId
          transId
          route
          lambdaName
          message
        }
      }
    `,
    variables: { limit },
  }

  try {
    const response = await fetch(env.APPSYNC_EVENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.APPSYNC_API_KEY,
      },
      body: JSON.stringify(query),
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as {
      data?: { recentDashboardEvents?: DashboardEvent[] }
    }

    return payload.data?.recentDashboardEvents ?? []
  } catch {
    return []
  }
}
