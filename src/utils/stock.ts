/** Below this stock level (%) the bar turns red and the dashboard lists the machine as "Stok Menipis". */
export const LOW_STOCK_PERCENT = 40

/** Below this level (%) a stock bar is orange instead of green. */
export const MID_STOCK_PERCENT = 70

/** Color band of a stock level (%): red below LOW_STOCK_PERCENT, orange below MID_STOCK_PERCENT, green above. */
export function stockBand(percent: number): 'low' | 'mid' | 'high' {
  return percent < LOW_STOCK_PERCENT ? 'low' : percent < MID_STOCK_PERCENT ? 'mid' : 'high'
}
