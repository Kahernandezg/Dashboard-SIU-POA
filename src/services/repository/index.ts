import { IReportsRepository } from './IRepository';
import { CloudSqlReportsRepository } from './CloudSqlRepository';

// Instancia singleton activa del repositorio respaldada por Cloud SQL (PostgreSQL) con sincronización transparente
export const reportsRepository: IReportsRepository = new CloudSqlReportsRepository();

export * from './IRepository';
export * from './CloudSqlRepository';
export * from './DexieRepository';
