import Dexie, { Table } from 'dexie';
import { YearData, ChangeLogEntry } from '../types';
import { createSample2026Data } from './sampleData';

export class CraiDatabase extends Dexie {
  years!: Table<YearData, number>;
  changeLogs!: Table<ChangeLogEntry, number>;

  constructor() {
    super('CraiUcaReportsDB');
    this.version(1).stores({
      years: '&year, status, lastModified, modifiedBy',
      changeLogs: '++id, year, module, section, timestamp, user',
    });
  }
}

export const db = new CraiDatabase();

/**
 * Inicializa la base de datos si está vacía cargando los datos reales precargados de 2026.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const count = await db.years.count();
    if (count === 0) {
      const sample2026 = createSample2026Data();
      await db.years.add(sample2026);
      await db.changeLogs.add({
        year: 2026,
        module: 'AÑO',
        section: 'Inicialización',
        action: 'Carga inicial de datos institucionales 2026',
        timestamp: new Date().toISOString(),
        user: 'Sistema CRAI',
        detail: 'Carga automática de estructura y datos 2026 desde informes UCA',
      });
      console.log('Base de datos CRAI inicializada con datos 2026.');
    } else {
      // Migración automática: sustituir CoreTrustSeal por API de Google Maps ($66.00) si existía previamente
      const allYears = await db.years.toArray();
      for (const yData of allYears) {
        if (yData.poa && yData.poa.presupuesto) {
          let modified = false;
          yData.poa.presupuesto = yData.poa.presupuesto.map((p) => {
            if (p.rubro.toLowerCase().includes('coretrustseal')) {
              modified = true;
              return {
                ...p,
                rubro: '2- API de Google Maps',
                monto: 66,
                comentarios: 'Geolocalización y mapas de impacto (valor estimado)',
              };
            }
            return p;
          });
          if (modified) {
            await db.years.put(yData);
          }
        }

        // Migración automática: si publicaciones 2026 no tenían observaciones, poblar con las notas institucionales
        if (yData.year === 2026 && yData.poa && yData.poa.publicaciones) {
          const samplePubs = createSample2026Data().poa.publicaciones;
          let notesModified = false;
          yData.poa.publicaciones = yData.poa.publicaciones.map((pub) => {
            if (pub.observaciones === undefined) {
              const match = samplePubs.find((s) => s.id === pub.id || s.tipo.toLowerCase() === pub.tipo.toLowerCase());
              if (match?.observaciones) {
                notesModified = true;
                return { ...pub, observaciones: match.observaciones };
              }
            }
            return pub;
          });
          if (notesModified) {
            await db.years.put(yData);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando IndexedDB Dexie:', error);
  }
}
