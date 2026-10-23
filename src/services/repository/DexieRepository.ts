import { IReportsRepository } from './IRepository';
import { YearData, ChangeLogEntry } from '../../types';
import { db, initializeDatabase } from '../database';
import { cloneYearStructure, createSample2026Data } from '../sampleData';

export class DexieReportsRepository implements IReportsRepository {
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = initializeDatabase();
    }
    await this.initPromise;
  }

  async getAvailableYears(): Promise<number[]> {
    await this.ensureInitialized();
    const allYears = await db.years.toCollection().primaryKeys();
    return (allYears as number[]).sort((a, b) => b - a);
  }

  async getYearData(year: number): Promise<YearData | null> {
    await this.ensureInitialized();
    const data = await db.years.get(year);
    return data || null;
  }

  async saveYearData(
    data: YearData,
    logDetail?: { module: 'POA' | 'SIU' | 'AÑO'; section: string; user: string; action: string }
  ): Promise<void> {
    await this.ensureInitialized();
    data.lastModified = new Date().toISOString();
    if (logDetail?.user) {
      data.modifiedBy = logDetail.user;
    }
    await db.years.put(data);

    if (logDetail) {
      await db.changeLogs.add({
        year: data.year,
        module: logDetail.module,
        section: logDetail.section,
        action: logDetail.action,
        timestamp: data.lastModified,
        user: logDetail.user,
      });
    }
  }

  async cloneYear(sourceYear: number, targetYear: number, user: string): Promise<YearData> {
    await this.ensureInitialized();
    const existing = await db.years.get(targetYear);
    if (existing) {
      throw new Error(`El año ${targetYear} ya existe en el sistema.`);
    }

    const sourceData = await db.years.get(sourceYear);
    if (!sourceData) {
      throw new Error(`El año de origen ${sourceYear} no existe para clonar.`);
    }

    const cloned = cloneYearStructure(sourceData, targetYear);
    cloned.modifiedBy = user;
    cloned.lastModified = new Date().toISOString();

    await db.years.add(cloned);
    await db.changeLogs.add({
      year: targetYear,
      module: 'AÑO',
      section: 'Clonación',
      action: `Año ${targetYear} creado clonando estructura de ${sourceYear}`,
      timestamp: cloned.lastModified,
      user,
      detail: `Estructura copiada de ${sourceYear} con valores numéricos inicializados a cero.`,
    });

    return cloned;
  }

  async deleteYear(year: number, user: string): Promise<void> {
    await this.ensureInitialized();
    const totalYears = await db.years.count();
    if (totalYears <= 1) {
      throw new Error('No es posible eliminar el único año existente en el sistema.');
    }
    await db.years.delete(year);
    await db.changeLogs.add({
      year,
      module: 'AÑO',
      section: 'Eliminación',
      action: `Año ${year} eliminado del sistema`,
      timestamp: new Date().toISOString(),
      user,
    });
  }

  async getChangeLogs(year?: number): Promise<ChangeLogEntry[]> {
    await this.ensureInitialized();
    let query = db.changeLogs.orderBy('timestamp').reverse();
    if (year !== undefined) {
      const all = await query.toArray();
      return all.filter((l) => l.year === year);
    }
    return query.limit(100).toArray();
  }

  async exportFullBackup(): Promise<string> {
    await this.ensureInitialized();
    const years = await db.years.toArray();
    const changeLogs = await db.changeLogs.toArray();

    const backupObject = {
      app: 'CRAI_UCA_POA_SIU',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        years,
        changeLogs,
      },
    };

    return JSON.stringify(backupObject, null, 2);
  }

  async importFullBackup(jsonString: string): Promise<{ yearsImported: number }> {
    await this.ensureInitialized();
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.years)) {
        throw new Error('El archivo de respaldo no tiene un formato válido (data.years requerido).');
      }

      await db.transaction('rw', db.years, db.changeLogs, async () => {
        for (const y of parsed.data.years) {
          await db.years.put(y);
        }
        if (Array.isArray(parsed.data.changeLogs)) {
          for (const l of parsed.data.changeLogs) {
            delete l.id;
            await db.changeLogs.add(l);
          }
        }
      });

      return { yearsImported: parsed.data.years.length };
    } catch (err: any) {
      throw new Error(`Error al procesar el archivo JSON: ${err.message}`);
    }
  }

  async resetToSampleData(): Promise<void> {
    await db.transaction('rw', db.years, db.changeLogs, async () => {
      await db.years.clear();
      await db.changeLogs.clear();
      const sample = createSample2026Data();
      await db.years.add(sample);
      await db.changeLogs.add({
        year: 2026,
        module: 'AÑO',
        section: 'Restablecimiento',
        action: 'Datos restablecidos a los valores predeterminados 2026',
        timestamp: new Date().toISOString(),
        user: 'Usuario CRAI',
      });
    });
  }
}
