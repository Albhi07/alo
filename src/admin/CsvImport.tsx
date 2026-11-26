import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useT } from '../i18n'
import { db } from '../db'
import { QUESTION_CSV_TEMPLATE, validateQuestionCsv, type CsvRowResult } from './csv'
import { adminStore } from './store'

/** Bulk MCQ import: validate every row, show problems by line, import the valid rows. */
export default function CsvImport() {
  const { t, n } = useT()
  const chapterIds = useLiveQuery(async () => new Set(await db.c_chapters.toCollection().primaryKeys()), [], new Set<string>())
  const [results, setResults] = useState<CsvRowResult[] | null>(null)
  const [done, setDone] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const valid = results?.filter((r) => r.row) ?? []
  const invalid = results?.filter((r) => !r.row) ?? []

  async function onFile(f: File) {
    setDone(null)
    setResults(validateQuestionCsv(await f.text(), chapterIds))
  }
  async function importValid() {
    setBusy(true)
    const store = adminStore()
    for (const r of valid) await store.save('questions', r.row as never)
    setBusy(false)
    setDone(valid.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{t('admin.csvImport')}</h2>
      <p className="text-sm text-muted">{t('admin.csvHelp')}</p>
      <a className="btn-link self-start" download="alo-mcq-template.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(QUESTION_CSV_TEMPLATE)}`}>{t('admin.csvTemplate')}</a>
      <label className="label" htmlFor="csv">{t('admin.csvFile')}</label>
      <input id="csv" type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {results && (
        <div className="card flex flex-col gap-2" role="status">
          <p>{t('admin.csvSummary', { ok: valid.length, bad: invalid.length })}</p>
          {invalid.length > 0 && (
            <ul className="max-h-64 overflow-auto text-sm">
              {invalid.map((r) => <li key={r.line}><strong>{t('admin.csvLine', { n: r.line })}</strong> {r.errors.join('; ')}</li>)}
            </ul>
          )}
          <button className="btn-primary" disabled={!valid.length || busy || done !== null} onClick={importValid}>{t('admin.csvImportN', { n: valid.length })}</button>
          {done !== null && <p className="font-semibold">{t('admin.csvDone', { n: n(done) })}</p>}
        </div>
      )}
    </div>
  )
}
