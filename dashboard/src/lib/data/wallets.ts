import { getWalletDetail, getWalletList } from '@/lib/analytics/queries'
import type { TimeRangeInput } from '@/lib/types/api'

export async function getWalletsPageData(input?: TimeRangeInput) {
  const wallets = await getWalletList(input)
  return { wallets }
}

export async function getWalletDetailPageData(walletAddress: string, input?: TimeRangeInput) {
  return getWalletDetail(walletAddress, input)
}
