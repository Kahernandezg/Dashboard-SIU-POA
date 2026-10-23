import React, { useState, useEffect } from 'react';
import { reportsRepository } from '../../services/repository';
import { ChangeLogEntry } from '../../types';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  History,
  Sparkles,
  Cloud,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface SettingsProps {
  currentYear: number;
  onRefreshAll: () => Promise<void>;
}

export const SettingsModule: React.FC<SettingsProps> = ({ currentYear, onRefreshAll }) => {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [aiStatus, setAiStatus] = useState<{ available: boolean; model: string } | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadLogs();
    checkAiStatus();
  }, [currentYear]);

  const loadLogs = async () => {
    try {
      const entries = await reportsRepository.getChangeLogs();
      setLogs(entries);
    } catch (e) {
      console.error(e);
    }
  };

  const checkAiStatus = async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch {
      setAiStatus({ available: false, model: 'gemini-3.8-flash' });
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const jsonStr = await reportsRepository.exportFullBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Respaldo_Completo_CRAI_UCA_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ text: 'Respaldo JSON generado y descargado correctamente.', type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error al exportar respaldo', type: 'error' });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const res = await reportsRepository.importFullBackup(text);
      await onRefreshAll();
      await loadLogs();
      setMsg({ text: `¡Respaldo importado con éxito! Se restauraron ${res.yearsImported} años.`, type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error al importar respaldo', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetSampleData = async () => {
    if (!window.confirm('¿Está seguro de restablecer todos los datos a los valores de ejemplo originales de 2026? Se reemplazarán los cambios actuales.')) {
      return;
    }

    try {
      setIsResetting(true);
      await reportsRepository.resetToSampleData();
      await onRefreshAll();
      await loadLogs();
      setMsg({ text: 'Base de datos restablecida a los datos reales predeterminados de 2026.', type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error al restablecer datos', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configuración, Respaldo y Persistencia
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gestión del almacenamiento local en IndexedDB (Dexie), auditoría de cambios y preparación para Firebase.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Bloque 1: Respaldo Completo de la Base de Datos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#234a80]/10 dark:bg-[#234a80]/25 text-[#234a80] dark:text-[#9bc2f7] rounded-lg">
            <Database className="w-5 h-5 text-[#234a80] dark:text-[#9bc2f7]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Respaldo y Restauración de Base de Datos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Almacenamiento persistente local mediante IndexedDB (Dexie). Exporte o importe copias de seguridad en formato JSON.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Exportar */}
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#e06d26]" />
            <span>Descargar Respaldo JSON</span>
          </button>

          {/* Importar */}
          <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>{isImporting ? 'Restaurando...' : 'Restaurar desde JSON'}</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          {/* Restablecer Ejemplos */}
          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetSampleData}
            className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>{isResetting ? 'Restableciendo...' : 'Restablecer Datos 2026'}</span>
          </button>
        </div>
      </div>

      {/* Bloque 2: Integración Gemini AI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#234a80]/10 dark:bg-[#234a80]/25 text-[#234a80] dark:text-[#9bc2f7] rounded-lg">
              <Sparkles className="w-5 h-5 text-[#e06d26]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Asistente de Redacción Institucional Gemini AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modelo: {aiStatus?.model || 'gemini-3.8-flash'} · Conexión segura por proxy del servidor
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              aiStatus?.available
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {aiStatus?.available ? 'Activo en servidor' : 'Clave no configurada'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          El botón <strong>&quot;Generar resumen con Gemini&quot;</strong> en el Análisis Cualitativo del POA condensa los logros, dificultades y acciones realizadas al límite exacto de 1000 caracteres solicitado por la UCA. Su clave de API se inyecta desde los secretos del servidor sin exponerse al navegador.
        </p>
      </div>

      {/* Bloque 3: Arquitectura para Migración a Firebase / Firestore */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#234a80]/10 dark:bg-[#234a80]/25 text-[#234a80] dark:text-[#9bc2f7] rounded-lg">
            <Cloud className="w-5 h-5 text-[#234a80] dark:text-[#9bc2f7]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Capa de Repositorio Desacoplada (Migración a Firebase)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patrón repositorio implementado en <code className="font-mono text-[#234a80] dark:text-[#9bc2f7]">src/services/repository</code>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Toda la interfaz interactúa exclusivamente con la interfaz <code className="font-mono">IReportsRepository</code>. Para migrar de IndexedDB local a Firestore en la nube, basta con implementar los métodos en <code className="font-mono">FirestoreRepositoryStub.ts</code> y sustituir el singleton en <code className="font-mono">index.ts</code> sin modificar ningún componente visual de la aplicación.
        </p>
      </div>

      {/* Bloque 4: Registro de Auditoría de Cambios */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Registro de Auditoría de Cambios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historial de modificaciones por usuario, fecha y sección
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">{logs.length} registros</span>
        </div>

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2 font-medium">Fecha y Hora</th>
                <th className="px-3 py-2 font-medium">Módulo</th>
                <th className="px-3 py-2 font-medium">Sección</th>
                <th className="px-3 py-2 font-medium">Acción Realizada</th>
                <th className="px-3 py-2 font-medium">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No hay registros de cambios recientes.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono tabular-nums text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('es-SV')}
                    </td>
                    <td className="px-3 py-2 font-semibold text-[#234a80] dark:text-[#9bc2f7]">
                      {log.module}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                      {log.section}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {log.action}
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {log.user}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
