import { IReportsRepository } from './IRepository';
import { YearData, ChangeLogEntry } from '../../types';
import { DexieReportsRepository } from './DexieRepository';

export class CloudSqlReportsRepository implements IReportsRepository {
  private fallbackRepo: DexieReportsRepository;

  constructor() {
    this.fallbackRepo = new DexieReportsRepository();
  }

  async getAvailableYears(): Promise<number[]> {
    try {
      const localYears = await this.fallbackRepo.getAvailableYears();
      const res = await fetch('/api/reports/years');
      if (res.ok) {
        const remoteYears = await res.json();
        if (Array.isArray(remoteYears)) {
          const merged = Array.from(new Set([...remoteYears, ...localYears])).sort((a, b) => b - a);
          return merged.length > 0 ? merged : [2026];
        }
      }
      return localYears.length > 0 ? localYears : [2026];
    } catch (err) {
      console.warn('Cloud SQL unavailable, using local cache:', err);
      return await this.fallbackRepo.getAvailableYears();
    }
  }

  async getYearData(year: number): Promise<YearData | null> {
    const localData = await this.fallbackRepo.getYearData(year);

    try {
      const res = await fetch(`/api/reports/${year}`);
      if (!res.ok) {
        // If Cloud SQL doesn't have it or returned error, fallback to local
        return localData;
      }

      const remoteData: YearData = await res.json();

      // If we have both, compare lastModified timestamps
      if (localData && remoteData) {
        const localTime = new Date(localData.lastModified || 0).getTime();
        const remoteTime = new Date(remoteData.lastModified || 0).getTime();

        const isRemoteFactory =
          remoteData.modifiedBy === 'Plantilla Inicial CRAI' ||
          remoteData.modifiedBy === 'Sistema CRAI (Inicial)' ||
          remoteData.lastModified === '2026-01-01T00:00:00.000Z';

        const isLocalUserEdited =
          localData.modifiedBy !== 'Plantilla Inicial CRAI' &&
          localData.modifiedBy !== 'Sistema CRAI (Inicial)' &&
          localData.lastModified !== '2026-01-01T00:00:00.000Z';

        // If local data is newer or local data was edited by user while remote is factory template
        if (localTime > remoteTime || (isLocalUserEdited && isRemoteFactory)) {
          fetch(`/api/reports/${year}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: localData,
              user: localData.modifiedBy || 'Kevin Hernández',
            }),
          }).catch((e) => console.warn('Background sync to server failed:', e));
          return localData;
        }
      }

      // If remote data is newer or local didn't exist, update local cache with remote data
      if (remoteData) {
        // Preservar seccionesActivas locales si existían y remote no las tiene
        if (localData?.siu?.seccionesActivas && (!remoteData.siu || !remoteData.siu.seccionesActivas)) {
          if (!remoteData.siu) (remoteData as any).siu = {};
          remoteData.siu.seccionesActivas = localData.siu.seccionesActivas;
        }
        await this.fallbackRepo.saveYearData(remoteData);
        return remoteData;
      }

      return localData;
    } catch (err) {
      console.warn(`Cloud SQL fetch failed for year ${year}, using local cache:`, err);
      return localData;
    }
  }

  async saveYearData(
    data: YearData,
    logDetail?: { module: 'POA' | 'SIU' | 'AÑO'; section: string; user: string; action: string }
  ): Promise<void> {
    // Save to local cache first
    await this.fallbackRepo.saveYearData(data, logDetail);

    // Sync to Cloud SQL
    try {
      await fetch(`/api/reports/${data.year}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          user: logDetail?.user || data.modifiedBy || 'Kevin Hernández',
          logDetail,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync changes to Cloud SQL:', err);
    }
  }

  async cloneYear(sourceYear: number, targetYear: number, user: string): Promise<YearData> {
    try {
      const res = await fetch('/api/reports/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceYear, targetYear, user }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newYearData: YearData = await res.json();
      await this.fallbackRepo.saveYearData(newYearData);
      return newYearData;
    } catch (err) {
      console.warn('Cloud SQL clone failed, cloning in local repository:', err);
      return await this.fallbackRepo.cloneYear(sourceYear, targetYear, user);
    }
  }

  async deleteYear(year: number, user: string): Promise<void> {
    await this.fallbackRepo.deleteYear(year, user);
    try {
      await fetch(`/api/reports/${year}?user=${encodeURIComponent(user)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Cloud SQL delete failed:', err);
    }
  }

  async getChangeLogs(year?: number): Promise<ChangeLogEntry[]> {
    try {
      const res = await fetch(`/api/reports/${year || 2026}/changelogs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const logs = await res.json();
      if (Array.isArray(logs) && logs.length > 0) {
        return logs;
      }
      return await this.fallbackRepo.getChangeLogs(year);
    } catch (err) {
      return await this.fallbackRepo.getChangeLogs(year);
    }
  }

  async exportFullBackup(): Promise<string> {
    return await this.fallbackRepo.exportFullBackup();
  }

  async importFullBackup(jsonString: string): Promise<{ yearsImported: number }> {
    const result = await this.fallbackRepo.importFullBackup(jsonString);
    // Sync imported data to Cloud SQL
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.years)) {
        for (const y of parsed.years) {
          await fetch(`/api/reports/${y.year}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: y, user: 'Importación Backup' }),
          });
        }
      }
    } catch (err) {
      console.warn('Failed to sync imported backup to Cloud SQL:', err);
    }
    return result;
  }

  async resetToSampleData(): Promise<void> {
    await this.fallbackRepo.resetToSampleData();
    try {
      await fetch('/api/reports/reset', { method: 'POST' });
    } catch (err) {
      console.warn('Failed to reset Cloud SQL data:', err);
    }
  }
}
