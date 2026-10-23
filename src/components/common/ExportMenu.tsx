import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Database, FileCode } from 'lucide-react';
import { exportPOAExcel, exportSIUConsolidatedExcel, exportToCSV, exportWorkbook } from '../../services/excelExport';
import { downloadEmptyTemplate } from '../../services/excelImport';
import { reportsRepository } from '../../services/repository';
import { YearData } from '../../types';

interface ExportMenuProps {
  yearData: YearData;
  activeModule: 'inicio' | 'poa' | 'siu' | 'config';
  currentSectionId?: string;
  currentSectionData?: { title: string; rows: any[][] };
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  yearData,
  activeModule,
  currentSectionId,
  currentSectionData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPOA = () => {
    exportPOAExcel(yearData);
    setIsOpen(false);
  };

  const handleExportSIU = () => {
    exportSIUConsolidatedExcel(yearData);
    setIsOpen(false);
  };

  const handleExportCurrentSectionExcel = () => {
    if (!currentSectionData) return;
    exportWorkbook(`${currentSectionData.title}_${yearData.year}.xlsx`, [
      { name: currentSectionData.title.substring(0, 31), data: currentSectionData.rows },
    ]);
    setIsOpen(false);
  };

  const handleExportCurrentSectionCSV = () => {
    if (!currentSectionData) return;
    exportToCSV(`${currentSectionData.title}_${yearData.year}.csv`, currentSectionData.rows);
    setIsOpen(false);
  };

  const handleDownloadFullBackup = async () => {
    const jsonStr = await reportsRepository.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Respaldo_CRAI_UCA_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    downloadEmptyTemplate(currentSectionId || 'poa_publicaciones', format);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#e06d26]" />
        <span>Exportar</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs focus:outline-none divide-y divide-slate-100 dark:divide-slate-800">
          <div className="p-1.5">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Informes Consolidados
            </div>
            <button
              type="button"
              onClick={handleExportPOA}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-[#234a80]/10 dark:hover:bg-[#234a80]/20 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium">Informe POA Completo (.xlsx)</div>
                <div className="text-[10px] text-slate-400">Todas las 7 secciones en hojas individuales</div>
              </div>
            </button>
            <button
              type="button"
              onClick={handleExportSIU}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-[#234a80]/10 dark:hover:bg-[#234a80]/20 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#234a80] dark:text-[#9bc2f7] shrink-0" />
              <div>
                <div className="font-medium">Informe SIU Consolidado (.xlsx)</div>
                <div className="text-[10px] text-slate-400">18 hojas idénticas al libro oficial CRAI</div>
              </div>
            </button>
          </div>

          {currentSectionData && (
            <div className="p-1.5">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Sección Actual
              </div>
              <button
                type="button"
                onClick={handleExportCurrentSectionExcel}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar tabla actual a Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleExportCurrentSectionCSV}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar tabla actual a CSV (UTF-8)</span>
              </button>
            </div>
          )}

          <div className="p-1.5">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Plantillas & Respaldo
            </div>
            <button
              type="button"
              onClick={() => handleDownloadTemplate('xlsx')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Descargar plantilla de captura (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadFullBackup}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>Respaldo completo de base de datos (JSON)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
