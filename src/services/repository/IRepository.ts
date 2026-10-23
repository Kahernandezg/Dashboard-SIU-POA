import { YearData, ChangeLogEntry } from '../../types';

export interface IReportsRepository {
  /**
   * Obtiene la lista de todos los años disponibles ordenados ascendentemente o descendentemente
   */
  getAvailableYears(): Promise<number[]>;

  /**
   * Obtiene todos los datos del año especificado
   */
  getYearData(year: number): Promise<YearData | null>;

  /**
   * Guarda o actualiza los datos completos de un año
   */
  saveYearData(data: YearData, logDetail?: { module: 'POA' | 'SIU' | 'AÑO'; section: string; user: string; action: string }): Promise<void>;

  /**
   * Crea un nuevo año clonando la estructura de un año existente
   */
  cloneYear(sourceYear: number, targetYear: number, user: string): Promise<YearData>;

  /**
   * Elimina un año de la base de datos
   */
  deleteYear(year: number, user: string): Promise<void>;

  /**
   * Obtiene el registro de auditoría de cambios
   */
  getChangeLogs(year?: number): Promise<ChangeLogEntry[]>;

  /**
   * Exporta toda la base de datos en formato JSON
   */
  exportFullBackup(): Promise<string>;

  /**
   * Importa y reemplaza/combina un respaldo completo en JSON
   */
  importFullBackup(jsonString: string): Promise<{ yearsImported: number }>;

  /**
   * Restablece los datos a los valores de ejemplo de 2026
   */
  resetToSampleData(): Promise<void>;
}
