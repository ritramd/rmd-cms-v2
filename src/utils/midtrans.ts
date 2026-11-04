// Midtrans Snap script loader and helper.

let snapLoadingPromise: Promise<boolean> | null = null

export function loadMidtransSnap(clientKey = 'Mid-client-O5Qx9-an8ATS102S'): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.snap) return Promise.resolve(true)
  if (snapLoadingPromise) return snapLoadingPromise

  snapLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="snap/snap.js"]')
    if (existing) {
      if (window.snap) {
        resolve(true)
        return
      }
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://app.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      console.error('Gagal memuat script Midtrans Snap')
      resolve(false)
    }
    document.head.appendChild(script)
  })

  return snapLoadingPromise
}
