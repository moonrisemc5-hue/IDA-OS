import React, { useEffect, useRef, useState } from 'react'
import { Workbook } from '@fortune-sheet/react'
import { FortuneExcelHelper, importToolBarItem, exportToolBarItem } from '@corbe30/fortune-excel'
import '@fortune-sheet/react/dist/index.css'
import { Check, FilePlus, FolderOpen, Save } from 'lucide-react'
import './daexcelent.css'

type Cell = { v: string; bold?: boolean; italic?: boolean; underline?: boolean; color?: string; bg?: string; align?: 'left' | 'center' | 'right'; fmt?: 'general' | 'number' | 'currency' | 'percent'; wrap?: boolean; border?: boolean; font?: string }
type Sheet = { name: string; cells: Record<string, Cell> }
type Book = { version: 1; active: number; sheets: Sheet[] }
type SavedFile = { id: string; name: string; mime?: string; data?: string; location?: string }
type EngineCell = { r: number; c: number; v: Record<string, any> }
type EngineSheet = { name: string; celldata: EngineCell[]; [key: string]: any }

const colName = (n: number) => { let s = ''; while (n >= 0) { s = String.fromCharCode(n % 26 + 65) + s; n = Math.floor(n / 26) - 1 } return s }
const parseRef = (ref: string) => { const m = ref.toUpperCase().match(/^([A-Z]+)([1-9]\d*)$/); if (!m) return null; let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { r: Number(m[2]) - 1, c: c - 1 } }
const freshBook = (): Book => ({ version: 1, active: 0, sheets: [{ name: 'Sheet1', cells: { A1: { v: 'Welcome to DaExcelent', bold: true, bg: '#dbeafe', color: '#1d4ed8' }, A2: { v: 'A real spreadsheet engine is ready to use' }, A4: { v: 'Try a formula in B4', italic: true }, B4: { v: '=SUM(B1:B3)' } } }] })

function bookToEngine(book: Book): EngineSheet[] {
  const sheets = book.sheets.length ? book.sheets : freshBook().sheets
  return sheets.map(sheet => {
    const celldata: EngineCell[] = []
    for (const [address, cell] of Object.entries(sheet.cells || {})) {
      const p = parseRef(address)
      if (!p) continue
      const formula = cell.v.startsWith('=') ? cell.v.slice(1) : undefined
      const numeric = cell.v !== '' && !formula && Number.isFinite(Number(cell.v))
      const v: Record<string, any> = {
        v: formula ? null : (numeric ? Number(cell.v) : cell.v),
        m: formula ? undefined : cell.v,
        ct: { fa: cell.fmt === 'currency' ? '$#,##0.00' : cell.fmt === 'percent' ? '0.00%' : cell.fmt === 'number' ? '#,##0.########' : 'General', t: numeric || formula ? 'n' : 'g' },
      }
      if (formula) v.f = formula
      if (cell.bold) v.bl = 1
      if (cell.italic) v.it = 1
      if (cell.underline) v.un = 1
      if (cell.color) v.fc = cell.color
      if (cell.bg) v.bg = cell.bg
      if (cell.align) v.ht = cell.align === 'left' ? 1 : cell.align === 'center' ? 0 : 2
      if (cell.wrap) v.tb = 2
      if (cell.border) v.bd = { left: { style: 1, color: '#808080' }, right: { style: 1, color: '#808080' }, top: { style: 1, color: '#808080' }, bottom: { style: 1, color: '#808080' } }
      if (cell.font) v.ff = cell.font
      celldata.push({ r: p.r, c: p.c, v })
    }
    return { name: sheet.name, celldata, config: {} }
  })
}

function engineToBook(data: EngineSheet[], active: number): Book {
  const sheets: Sheet[] = (data || []).map((sheet, index) => {
    const cells: Record<string, Cell> = {}
    const entries: EngineCell[] = Array.isArray(sheet.celldata) ? sheet.celldata : []
    for (const entry of entries) {
      if (!entry || !entry.v) continue
      const address = colName(entry.c) + (entry.r + 1)
      const v = entry.v
      const formula = typeof v.f === 'string' && v.f ? '=' + v.f.replace(/^=/, '') : undefined
      const raw = v.v ?? v.m ?? ''
      const cell: Cell = { v: formula ?? (raw === null || raw === undefined ? '' : String(raw)) }
      if (v.bl) cell.bold = true
      if (v.it) cell.italic = true
      if (v.un) cell.underline = true
      if (v.fc) cell.color = String(v.fc)
      if (v.bg) cell.bg = String(v.bg)
      if (v.ht === 1) cell.align = 'left'
      else if (v.ht === 0) cell.align = 'center'
      else if (v.ht === 2) cell.align = 'right'
      if (v.tb) cell.wrap = true
      if (v.bd) cell.border = true
      if (v.ff) cell.font = String(v.ff)
      const fmt = String(v.ct?.fa || '').toLowerCase()
      if (fmt.includes('%')) cell.fmt = 'percent'
      else if (fmt.includes('$') || fmt.includes('€') || fmt.includes('£')) cell.fmt = 'currency'
      else if (fmt.includes('#') || fmt.includes('0.')) cell.fmt = 'number'
      if (cell.v !== '' || cell.bold || cell.italic || cell.underline || cell.bg || cell.color || cell.border || cell.font || cell.fmt) cells[address] = cell
    }
    return { name: String(sheet.name || 'Sheet' + (index + 1)), cells }
  })
  return { version: 1, active: Math.max(0, Math.min(active, Math.max(0, sheets.length - 1))), sheets: sheets.length ? sheets : freshBook().sheets }
}

function decodeBook(data: string): Book {
  const raw = data.includes(',') ? data.slice(data.indexOf(',') + 1) : data
  const text = decodeURIComponent(escape(atob(raw)))
  const parsed = JSON.parse(text)
  if (parsed?.version === 1 && Array.isArray(parsed.sheets) && parsed.sheets.length) return parsed
  throw new Error('Not a DaExcelent workbook')
}

export default function DaExcelentPanel({ initialFile, availableFiles = [], onSaveToFiles }: { initialFile?: SavedFile; availableFiles?: SavedFile[]; onSaveToFiles?: (name: string, mime: string, data: string) => void }) {
  const [book, setBook] = useState<Book>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ida-daexcelent-autosave-v1') || 'null')
      return saved?.version === 1 && Array.isArray(saved.sheets) && saved.sheets.length ? saved : freshBook()
    } catch { return freshBook() }
  })
  const [engineKey, setEngineKey] = useState(0)
  const [engineData, setEngineData] = useState<EngineSheet[]>(() => bookToEngine(book))
  const sheetRef = useRef<any>(null)
  const [saved, setSaved] = useState(true)
  const [showOpen, setShowOpen] = useState(false)
  const [toast, setToast] = useState('')
  const persist = (next: Book) => {
    setBook(next)
    setSaved(false)
    try { localStorage.setItem('ida-daexcelent-autosave-v1', JSON.stringify(next)); setSaved(true) } catch { setSaved(false) }
  }

  useEffect(() => {
    if (!initialFile?.id || !initialFile.data) return
    try {
      const next = decodeBook(initialFile.data)
      setBook(next)
      setEngineData(bookToEngine(next))
      setEngineKey(k => k + 1)
      setToast('Workbook opened')
    } catch { setToast('Could not open this workbook') }
  }, [initialFile?.id])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    try { localStorage.setItem('ida-daexcelent-autosave-v1', JSON.stringify(book)); setSaved(true) }
    catch { setSaved(false) }
  }, [book])

  const newBook = () => {
    if (!window.confirm('Create a new workbook? Your current workbook remains autosaved on this device.')) return
    const next = freshBook()
    setBook(next)
    setEngineData(bookToEngine(next))
    setEngineKey(k => k + 1)
    setToast('New workbook created')
  }
  const exportBook = () => {
    const answer = window.prompt('Workbook name', 'Workbook')
    if (answer === null) return
    const safe = answer.trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 80) || 'Workbook'
    const json = JSON.stringify(book, null, 2)
    const data = 'data:application/vnd.ida.daexcelent+json;base64,' + btoa(unescape(encodeURIComponent(json)))
    if (onSaveToFiles) {
      onSaveToFiles(safe + '.daexcelent', 'application/vnd.ida.daexcelent+json', data)
      setToast('Saved to DaFiles')
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      a.download = safe + '.daexcelent'
      a.click()
      URL.revokeObjectURL(a.href)
    }
  }
  const openFile = (file: SavedFile) => {
    if (!file.data) { setToast('This file has no workbook data'); return }
    try {
      const next = decodeBook(file.data)
      setBook(next)
      setEngineData(bookToEngine(next))
      setEngineKey(k => k + 1)
      setShowOpen(false)
      setToast('Workbook opened')
    } catch { setToast('Could not open workbook') }
  }

  return <div className="daexcelent dx-engine-shell">
    <header className="dx-titlebar">
      <div className="dx-brand"><span className="dx-logo"><svg viewBox="0 0 40 40" aria-label="DaExcelent spreadsheet logo"><path d="M7 3h19l7 7v27H7z" fill="#fff"/><path d="M26 3v8h7" fill="#b7e4c7"/><path d="M3 11h18v23H3z" fill="#107c41"/><path d="M7 16h10M7 21h10M7 26h10M7 31h10M12 16v15M17 16v15" stroke="#fff" strokeWidth="1.5"/><path d="M22 15h7M22 21h7M22 27h7" stroke="#107c41" strokeWidth="2"/></svg></span><div><b>DaExcelent</b><small>Spreadsheet studio</small></div></div>
      <div className="dx-document-title">Workbook <span className={saved ? 'dx-saved' : 'dx-saving'}><Check size={12}/>{saved ? 'Saved on this device' : 'Saving…'}</span></div>
      <div className="dx-actions"><button onClick={newBook}><FilePlus size={15}/>New</button><button onClick={() => setShowOpen(v => !v)}><FolderOpen size={15}/>Open</button><button className="dx-primary" onClick={exportBook}><Save size={15}/>Save to DaFiles</button></div>
    </header>
    <div className="dx-engine-workspace" key={engineKey}>
      <FortuneExcelHelper setKey={setEngineKey} setSheets={setEngineData} sheetRef={sheetRef} config={{ import: { xlsx: true, csv: true }, export: { xlsx: true, csv: true } }} />
      <Workbook ref={sheetRef} data={engineData as any} lang="en" showToolbar={true} showFormulaBar={true} showSheetTabs={true} row={100} column={26} defaultFontSize={11} cellContextMenu={['copy','paste','|','insert-row','insert-column','delete-row','delete-column','delete-cell','hide-row','hide-column','clear','sort','filter','chart','image','link','data','cell-format']} customToolbarItems={[importToolBarItem(), exportToolBarItem()]} onChange={(data: any) => { if (Array.isArray(data)) { setEngineData(data); persist(engineToBook(data as EngineSheet[], book.active)) } }} />
    </div>
    {showOpen && <div className="dx-open-panel"><div><b>Open a workbook from DaFiles</b><button onClick={() => setShowOpen(false)}>×</button></div>{availableFiles.filter(f => /\.daexcelent$/i.test(f.name)).map(f => <button key={f.id} onClick={() => openFile(f)}><FolderOpen size={16}/>{f.name}</button>)}{!availableFiles.some(f => /\.daexcelent$/i.test(f.name)) && <p>No DaExcelent workbooks saved in DaFiles yet.</p>}</div>}
    {toast && <div className="dx-toast"><Check size={15}/>{toast}</div>}
  </div>
}
