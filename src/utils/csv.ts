import { saveFile } from './download'

/** Builds a CSV file from rows and triggers a browser download. */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const escape = (cell: string | number) => {
    const text = String(cell)
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  // BOM so Excel opens UTF-8 correctly.
  saveFile(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }), filename)
}
