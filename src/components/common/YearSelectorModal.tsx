import React, { useState } from 'react';
import { Calendar, Copy, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { YearData } from '../../types';

interface YearSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableYears: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onCloneYear: (sourceYear: number, newYear: number) => Promise<void>;
  onDeleteYear: (year: number) => Promise<void>;
  yearDataMap?: { [year: number]: YearData };
}

export const YearSelectorModal: React.FC<YearSelectorModalProps> = ({
  isOpen,
  onClose,
  availableYears,
  selectedYear,
  onSelectYear,
  onCloneYear,
  onDeleteYear,
  yearDataMap = {},
}) => {
  const [sourceYear, setSourceYear] = useState<number>(selectedYear);
  const [newYearInput, setNewYearInput] = useState<number>(Math.max(...availableYears, 2026) + 1);
  const [isCloning, setIsCloning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteYear, setConfirmDeleteYear] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCreateClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (availableYears.includes(newYearInput)) {
      setErrorMsg(`El año ${newYearInput} ya existe en el sistema.`);
      return;
    }
    if (newYearInput < 2020 || newYearInput > 2040) {
      setErrorMsg('Por favor ingrese un año válido entre 2020 y 2040.');
      return;
    }

    try {
      setIsCloning(true);
      await onCloneYear(sourceYear, newYearInput);
      onSelectYear(newYearInput);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al clonar el año.');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#234a80]/10 dark:bg-[#234a80]/25 text-[#234a80] dark:text-[#9bc2f7] rounded-lg">
              <Calendar className="w-5 h-5 text-[#e06d26]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Gestor de Años y Ejercicios</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Seleccionar año de trabajo o clonar estructura</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulario de Clonación de Año */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-[#e06d26]" />
              <span>Crear Año Nuevo (Clonar Estructura)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Copia todas las categorías, indicadores, recursos electrónicos y nombres del año anterior, dejando valores numéricos en 0 y observaciones vacías.
            </p>

            <form onSubmit={handleCreateClone} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Clonar desde año:
                  </label>
                  <select
                    value={sourceYear}
                    onChange={(e) => setSourceYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-1 focus:ring-[#234a80]"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        Año {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nuevo año a crear:
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2040"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-1 focus:ring-[#234a80]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCloning}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer border border-[#234a80]"
              >
                <Plus className="w-3.5 h-3.5 text-[#e06d26]" />
                <span>{isCloning ? 'Clonando estructura...' : `Crear ${newYearInput} clonando de ${sourceYear}`}</span>
              </button>
            </form>
          </div>

          {/* Lista de Años Existentes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Años Registrados en el Sistema
            </h4>
            <div className="space-y-2">
              {availableYears.map((yr) => {
                const yrData = yearDataMap[yr];
                const isSelected = yr === selectedYear;

                return (
                  <div
                    key={yr}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#234a80] bg-[#234a80]/10 dark:bg-[#234a80]/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        onSelectYear(yr);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900 dark:text-white">{yr}</span>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-[#234a80] dark:text-[#9bc2f7]">
                            Activo
                          </span>
                        )}
                        {yrData?.status && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full ${
                              yrData.status === 'entregado'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : yrData.status === 'en_proceso'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {yrData.status === 'entregado'
                              ? 'Entregado'
                              : yrData.status === 'en_proceso'
                              ? 'En proceso'
                              : 'Sin iniciar'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {yrData?.modifiedBy ? `Modificado por: ${yrData.modifiedBy}` : 'CRAI UCA'} ·{' '}
                        {yrData?.lastModified
                          ? new Date(yrData.lastModified).toLocaleDateString('es-SV')
                          : 'Registrado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {availableYears.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteYear(yr)}
                          title={`Eliminar año ${yr}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Confirmar eliminación de año */}
        {confirmDeleteYear !== null && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs">
            <span className="text-rose-800 dark:text-rose-300">
              ¿Eliminar definitivamente el año <strong>{confirmDeleteYear}</strong> y todos sus datos?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteYear(null)}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteYear(confirmDeleteYear);
                  setConfirmDeleteYear(null);
                }}
                className="px-2.5 py-1 text-white bg-rose-600 hover:bg-rose-700 rounded font-medium"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
