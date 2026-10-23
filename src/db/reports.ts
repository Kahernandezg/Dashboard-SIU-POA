import { db } from './index.ts';
import { reports, changeLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import type { YearData, ChangeLogEntry } from '../types/index.ts';

export async function getReportYearsFromDb(): Promise<number[]> {
  try {
    const rows = await db.select({ year: reports.year }).from(reports);
    return rows.map((r) => r.year).sort((a, b) => b - a);
  } catch (error) {
    console.error('Failed to get report years from Cloud SQL:', error);
    throw new Error('Database query failed. Unable to fetch report years.', { cause: error });
  }
}

export async function getReportByYearFromDb(year: number): Promise<YearData | null> {
  try {
    const rows = await db.select().from(reports).where(eq(reports.year, year)).limit(1);
    if (!rows.length) return null;
    return rows[0].data as YearData;
  } catch (error) {
    console.error(`Failed to get report for year ${year} from Cloud SQL:`, error);
    throw new Error('Database query failed. Unable to fetch report data.', { cause: error });
  }
}

export async function upsertReportInDb(
  data: YearData,
  user: string
): Promise<void> {
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
    console.error('Failed to upsert report in Cloud SQL:', error);
    throw new Error('Database operation failed. Unable to save report data.', { cause: error });
  }
}

export async function getChangeLogsFromDb(year?: number): Promise<ChangeLogEntry[]> {
  try {
    let query = db.select().from(changeLogs);
    if (year) {
      const rows = await query.where(eq(changeLogs.year, year)).orderBy(desc(changeLogs.id)).limit(100);
      return rows as unknown as ChangeLogEntry[];
    }
    const rows = await query.orderBy(desc(changeLogs.id)).limit(100);
    return rows as unknown as ChangeLogEntry[];
  } catch (error) {
    console.error('Failed to get change logs from Cloud SQL:', error);
    throw new Error('Database query failed. Unable to fetch change logs.', { cause: error });
  }
}

export async function addChangeLogToDb(log: Omit<ChangeLogEntry, 'id'>): Promise<void> {
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
    console.error('Failed to insert change log in Cloud SQL:', error);
    // Non-fatal for logging
  }
}
