import { db } from './index.ts';
import { reports, changeLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import type { YearData, ChangeLogEntry } from '../types/index.ts';
import { createSample2026Data } from '../services/sampleData.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports_store.json');
const LOGS_FILE = path.join(DATA_DIR, 'changelogs_store.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'active_sections.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Cargar reportes almacenados en disco
function loadReportsFromDisk(): Map<number, YearData> {
  ensureDataDir();
  const map = new Map<number, YearData>();
  if (fs.existsSync(REPORTS_FILE)) {
    try {
      const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.year) {
            map.set(item.year, item);
          }
        }
      }
    } catch (err) {
      console.warn('Error reading reports_store.json from disk:', err);
    }
  }
  return map;
}

// Guardar reportes en disco de forma atómica
function saveReportsToDisk(map: Map<number, YearData>) {
  try {
    ensureDataDir();
    const arr = Array.from(map.values());
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing reports_store.json to disk:', err);
  }
}

// Cargar logs almacenados en disco
function loadLogsFromDisk(): ChangeLogEntry[] {
  ensureDataDir();
  if (fs.existsSync(LOGS_FILE)) {
    try {
      const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading changelogs_store.json from disk:', err);
    }
  }
  return [];
}

// Guardar logs en disco
function saveLogsToDisk(logs: ChangeLogEntry[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs.slice(0, 200), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing changelogs_store.json to disk:', err);
  }
}

// In-memory store respaldado por almacenamiento en disco
const inMemoryReports = new Map<number, YearData>();
let inMemoryLogs: ChangeLogEntry[] = [];
let nextLogId = 1;

// Inicialización de datos persistentes
try {
  const diskReports = loadReportsFromDisk();
  if (diskReports.size > 0) {
    for (const [y, data] of diskReports.entries()) {
      inMemoryReports.set(y, data);
    }
    console.log(`[Storage] Cargados ${diskReports.size} informes desde el disco local.`);
  } else {
    // Si no hay datos en disco, inicializar con la plantilla base de 2026 con fecha fija
    const initial2026 = createSample2026Data();
    initial2026.lastModified = '2026-01-01T00:00:00.000Z';
    initial2026.modifiedBy = 'Plantilla Inicial CRAI';
    inMemoryReports.set(2026, initial2026);
    saveReportsToDisk(inMemoryReports);
    console.log('[Storage] Inicializado archivo de datos persistente 2026.');
  }

  inMemoryLogs = loadLogsFromDisk();
  if (inMemoryLogs.length === 0) {
    inMemoryLogs.push({
      id: nextLogId++,
      year: 2026,
      module: 'AÑO',
      section: 'Inicialización',
      action: 'Carga inicial de datos institucionales 2026',
      user: 'Sistema CRAI',
      timestamp: '2026-01-01T00:00:00.000Z',
      detail: 'Carga automática de estructura y datos 2026 desde informes UCA',
    });
    saveLogsToDisk(inMemoryLogs);
  } else {
    const maxId = Math.max(...inMemoryLogs.map((l) => l.id ?? 0), 0);
    nextLogId = maxId + 1;
  }
} catch (e) {
  console.warn('Error inicializando almacenamiento persistente en disco:', e);
}

// Funciones para gestionar la configuración de hojas activas en disco
export function getActiveSectionsFromDisk(): string[] | null {
  ensureDataDir();
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading active_sections.json:', e);
    }
  }
  return null;
}

export function saveActiveSectionsToDisk(sections: string[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(sections, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing active_sections.json:', e);
  }
}

export async function getReportYearsFromDb(): Promise<number[]> {
  if (db) {
    try {
      const rows = await db.select({ year: reports.year }).from(reports);
      if (rows && rows.length > 0) {
        return rows.map((r) => r.year).sort((a, b) => b - a);
      }
    } catch (error) {
      console.warn('Cloud SQL query failed, falling back to disk store:', error);
    }
  }

  return Array.from(inMemoryReports.keys()).sort((a, b) => b - a);
}

export async function getReportByYearFromDb(year: number): Promise<YearData | null> {
  if (db) {
    try {
      const rows = await db.select().from(reports).where(eq(reports.year, year)).limit(1);
      if (rows && rows.length > 0) {
        const data = rows[0].data as YearData;
        inMemoryReports.set(year, data);
        saveReportsToDisk(inMemoryReports);
        return data;
      }
    } catch (error) {
      console.warn(`Cloud SQL fetch for year ${year} failed, falling back to disk store:`, error);
    }
  }

  return inMemoryReports.get(year) || null;
}

export async function upsertReportInDb(
  data: YearData,
  user: string
): Promise<void> {
  // Guardar en memoria y persistir inmediatamente a disco
  inMemoryReports.set(data.year, data);
  saveReportsToDisk(inMemoryReports);

  if (db) {
    try {
      const year = data.year;
      const status = data.status || 'en_proceso';

      await db
        .insert(reports)
        .values({
          year,
          status,
          data: data as any,
          modifiedBy: user,
          lastModified: new Date(),
        })
        .onConflictDoUpdate({
          target: reports.year,
          set: {
            status,
            data: data as any,
            modifiedBy: user,
            lastModified: new Date(),
          },
        });
    } catch (error) {
      console.warn('Cloud SQL upsert failed, stored in disk:', error);
    }
  }
}

export async function deleteReportFromDb(year: number): Promise<void> {
  inMemoryReports.delete(year);
  saveReportsToDisk(inMemoryReports);

  if (db) {
    try {
      await db.delete(reports).where(eq(reports.year, year));
    } catch (error) {
      console.warn(`Cloud SQL delete for year ${year} failed:`, error);
    }
  }
}

export async function getChangeLogsFromDb(year?: number): Promise<ChangeLogEntry[]> {
  if (db) {
    try {
      let query = db.select().from(changeLogs);
      if (year) {
        const rows = await query.where(eq(changeLogs.year, year)).orderBy(desc(changeLogs.id)).limit(100);
        return rows as unknown as ChangeLogEntry[];
      }
      const rows = await query.orderBy(desc(changeLogs.id)).limit(100);
      return rows as unknown as ChangeLogEntry[];
    } catch (error) {
      console.warn('Cloud SQL query for change logs failed, using disk store:', error);
    }
  }

  const filtered = year ? inMemoryLogs.filter((l) => l.year === year) : inMemoryLogs;
  return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 100);
}

export async function addChangeLogToDb(log: Omit<ChangeLogEntry, 'id'>): Promise<void> {
  const newEntry: ChangeLogEntry = {
    id: nextLogId++,
    ...log,
  };
  inMemoryLogs.unshift(newEntry);
  if (inMemoryLogs.length > 200) {
    inMemoryLogs.pop();
  }
  saveLogsToDisk(inMemoryLogs);

  if (db) {
    try {
      await db.insert(changeLogs).values({
        year: log.year,
        module: log.module,
        section: log.section,
        action: log.action,
        user: log.user,
        timestamp: log.timestamp,
        detail: log.detail || null,
      });
    } catch (error) {
      console.warn('Failed to insert change log in Cloud SQL (logged on disk):', error);
    }
  }
}
