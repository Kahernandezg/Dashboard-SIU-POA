/**
 * Plantilla arquitectónica para migración futura a Firebase Firestore.
 * Implementa la misma interfaz IReportsRepository.
 * Para activar Firestore:
 * 1. Inicializar Firebase SDK: initializeApp(firebaseConfig)
 * 2. Conectar a Firestore: const firestore = getFirestore()
 * 3. Asignar FirestoreReportsRepository en /src/services/repository/index.ts
 */
import { IReportsRepository } from './IRepository';
import { YearData, ChangeLogEntry } from '../../types';

export class FirestoreReportsRepositoryStub implements IReportsRepository {
  // private db = getFirestore();

  async getAvailableYears(): Promise<number[]> {
    console.info('[FirestoreStub] getAvailableYears llamado');
    // Implementación real:
    // const snapshot = await getDocs(collection(this.db, 'years'));
    // return snapshot.docs.map(doc => Number(doc.id)).sort((a,b) => b-a);
    return [2026];
  }

  async getYearData(year: number): Promise<YearData | null> {
    console.info(`[FirestoreStub] getYearData(${year})`);
    // const docSnap = await getDoc(doc(this.db, 'years', String(year)));
    // return docSnap.exists() ? docSnap.data() as YearData : null;
    return null;
  }

  async saveYearData(data: YearData, logDetail?: any): Promise<void> {
    console.info(`[FirestoreStub] saveYearData(${data.year})`, logDetail);
    // await setDoc(doc(this.db, 'years', String(data.year)), data);
  }

  async cloneYear(sourceYear: number, targetYear: number, user: string): Promise<YearData> {
    console.info(`[FirestoreStub] cloneYear ${sourceYear} -> ${targetYear}`);
    throw new Error('Firestore aún no conectado. Active las credenciales en firebase.ts');
  }

  async deleteYear(year: number, user: string): Promise<void> {
    console.info(`[FirestoreStub] deleteYear(${year})`);
    // await deleteDoc(doc(this.db, 'years', String(year)));
  }

  async getChangeLogs(year?: number): Promise<ChangeLogEntry[]> {
    return [];
  }

  async exportFullBackup(): Promise<string> {
    return JSON.stringify({ message: 'Backup Firestore stub' });
  }

  async importFullBackup(jsonString: string): Promise<{ yearsImported: number }> {
    return { yearsImported: 0 };
  }

  async resetToSampleData(): Promise<void> {
    // Reemplazo en Firestore
  }
}
