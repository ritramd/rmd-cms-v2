/**
 * Marks a downloaded file as exported from the CMS ("log-transaksi.xlsx" → "log-transaksi_CMS.xlsx"),
 * so clients can tell it apart from their own manual reports. Names already marked are kept.
 */
export function cmsFileName(filename: string): string {
  const dot = filename.lastIndexOf('.')
  const [base, ext] = dot > 0 ? [filename.slice(0, dot), filename.slice(dot)] : [filename, '']
  return /_CMS$/i.test(base) ? filename : `${base}_CMS${ext}`
}

/** Hands a file to the browser's download flow, named as a CMS export. */
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: cmsFileName(filename) })
  link.click()
  URL.revokeObjectURL(url)
}
