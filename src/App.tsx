import React, { useState, useEffect, useCallback } from 'react';
import { YearData, POAData, SIUData } from './types';
import { reportsRepository } from './services/repository';
import { Navbar } from './components/common/Navbar';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { POAModule } from './components/poa/POAModule';
import { SIUModule } from './components/siu/SIUModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { YearSelectorModal } from './components/common/YearSelectorModal';
import { ImportModal } from './components/common/ImportModal';

export default function App() {
  const [activeModule, setActiveModule] = useState<'inicio' | 'poa' | 'siu' | 'config'>('inicio');
  const [availableYears, setAvailableYears] = useState<number[]>([2026]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [yearData, setYearData] = useState<YearData | null>(null);
  const [yearDataMap, setYearDataMap] = useState<{ [y: number]: YearData }>({});

  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDefaultSection, setImportDefaultSection] = useState('poa_publicaciones');

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('crai_theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sincronizar clase dark en el elemento <html> y persistir en localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('crai_theme', 'dark');
      } catch (e) {
        console.error(e);
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('crai_theme', 'light');
      } catch (e) {
        console.error(e);
      }
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg((current) => (current === message ? null : current));
    }, 2800);
  };

  // Cargar años disponibles e inicializar
  const loadAvailableYears = useCallback(async () => {
    try {
      const years = await reportsRepository.getAvailableYears();
      setAvailableYears(years);
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[0]);
      }

      // Cargar mapa de años
      const map: { [y: number]: YearData } = {};
      for (const y of years) {
        const d = await reportsRepository.getYearData(y);
        if (d) map[y] = d;
      }
      setYearDataMap(map);
    } catch (err) {
      console.error('Error cargando años disponibles:', err);
    }
  }, [selectedYear]);

  // Cargar datos del año seleccionado
  const loadCurrentYearData = useCallback(async (year: number) => {
    try {
      let data = await reportsRepository.getYearData(year);
      if (data && data.poa && data.poa.presupuesto) {
        let changed = false;
        data.poa.presupuesto = data.poa.presupuesto.map((p) => {
          if (p.rubro.toLowerCase().includes('coretrustseal')) {
            changed = true;
            return {
              ...p,
              rubro: '2- API de Google Maps',
              monto: 66,
              comentarios: 'Geolocalización y mapas de impacto (valor estimado)',
            };
          }
          return p;
        });
        if (changed) {
          await reportsRepository.saveYearData(data);
        }
      }
      setYearData(data);
    } catch (err) {
      console.error(`Error cargando datos del año ${year}:`, err);
    }
  }, []);

  useEffect(() => {
    loadAvailableYears();
  }, [loadAvailableYears]);

  useEffect(() => {
    if (selectedYear) {
      loadCurrentYearData(selectedYear);
    }
  }, [selectedYear, loadCurrentYearData]);

  // Guardar cambios con debounce y registro de auditoría
  const handleSaveYearData = async (
    updated: YearData,
    logDetail?: { module: 'POA' | 'SIU' | 'AÑO'; section: string; user: string; action: string }
  ) => {
    setIsSaving(true);
    setYearData(updated);
    setYearDataMap((prev) => ({ ...prev, [updated.year]: updated }));

    try {
      await reportsRepository.saveYearData(updated, logDetail);
    } catch (err) {
      console.error('Error guardando en IndexedDB:', err);
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  // Manejar actualización de POA
  const handlePOAChange = (newPOA: POAData, sectionName: string) => {
    if (!yearData) return;
    const updated: YearData = {
      ...yearData,
      poa: newPOA,
    };
    handleSaveYearData(updated, {
      module: 'POA',
      section: sectionName,
      user: yearData.siu.cabecera.personaEnlace || 'Kevin Hernández',
      action: `Actualización de datos en ${sectionName}`,
    });
  };

  // Manejar actualización de SIU
  const handleSIUChange = (newSIU: SIUData, sectionName: string) => {
    if (!yearData) return;
    const updated: YearData = {
      ...yearData,
      siu: newSIU,
    };
    handleSaveYearData(updated, {
      module: 'SIU',
      section: sectionName,
      user: yearData.siu.cabecera.personaEnlace || 'Kevin Hernández',
      action: `Actualización de datos en ${sectionName}`,
    });
  };

  // Sincronizar Micelio (SIU 2.7) con datos de POA
  const handleSyncMicelioWithPOA = () => {
    if (!yearData) return;
    const poa = yearData.poa;
    const siu = yearData.siu;

    const updatedPubs = poa.publicaciones.map((p) => {
      const existing = siu.s27_micelio.publicacionesMes.find((m) => m.tipo.toLowerCase() === p.tipo.toLowerCase());
      return {
        id: existing?.id || `m-pub-${Date.now()}-${p.id}`,
        tipo: p.tipo,
        meses: existing ? [...existing.meses] : new Array(12).fill(0),
      };
    });

    const updatedSIU: SIUData = {
      ...siu,
      s27_micelio: {
        ...siu.s27_micelio,
        publicacionesMes: updatedPubs,
      },
    };

    handleSIUChange(updatedSIU, '2.7 Micelio (Sincronizado con POA)');
    showToast('¡Datos sincronizados exitosamente entre POA y SIU 2.7!');
  };

  // Clonar año
  const handleCloneYear = async (sourceYear: number, newYear: number) => {
    const user = yearData?.siu.cabecera.personaEnlace || 'Kevin Hernández';
    const cloned = await reportsRepository.cloneYear(sourceYear, newYear, user);
    await loadAvailableYears();
    setSelectedYear(newYear);
    setYearData(cloned);
    showToast(`Año ${newYear} creado exitosamente con la estructura de ${sourceYear}.`);
  };

  // Eliminar año
  const handleDeleteYear = async (yearToDelete: number) => {
    const user = yearData?.siu.cabecera.personaEnlace || 'Kevin Hernández';
    await reportsRepository.deleteYear(yearToDelete, user);
    await loadAvailableYears();
    showToast(`Año ${yearToDelete} eliminado del sistema.`);
  };

  // Importar y aplicar cambios desde el modal
  const handleApplyImport = async (updated: YearData, logMessage: string) => {
    await handleSaveYearData(updated, {
      module: 'AÑO',
      section: 'Importación Asistida',
      user: yearData?.siu.cabecera.personaEnlace || 'Kevin Hernández',
      action: logMessage,
    });
    showToast('Importación completada y datos recalculados.');
  };

  const handleOpenImport = (defaultSection: string) => {
    setImportDefaultSection(defaultSection);
    setIsImportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Barra de Navegación Principal */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        selectedYear={selectedYear}
        yearData={yearData}
        onOpenYearModal={() => setIsYearModalOpen(true)}
        isSaving={isSaving}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {yearData ? (
          <>
            {activeModule === 'inicio' && (
              <HomeDashboard
                yearData={yearData}
                onNavigate={setActiveModule}
                onOpenYearModal={() => setIsYearModalOpen(true)}
                year={selectedYear}
              />
            )}

            {activeModule === 'poa' && (
              <POAModule
                poaData={yearData.poa}
                onChange={handlePOAChange}
                year={selectedYear}
                onOpenImport={handleOpenImport}
              />
            )}

            {activeModule === 'siu' && (
              <SIUModule
                siuData={yearData.siu}
                poaData={yearData.poa}
                onChange={handleSIUChange}
                onSyncMicelioWithPOA={handleSyncMicelioWithPOA}
                year={selectedYear}
                onOpenImport={handleOpenImport}
              />
            )}

            {activeModule === 'config' && (
              <SettingsModule
                currentYear={selectedYear}
                onRefreshAll={async () => {
                  await loadAvailableYears();
                  await loadCurrentYearData(selectedYear);
                }}
              />
            )}
          </>
        ) : (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cargando base de datos CRAI UCA para el año {selectedYear}...
            </p>
          </div>
        )}
      </main>

      {/* Footer Institucional */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Centro de Recursos para el Aprendizaje y la Investigación (CRAI) · P. Florentino Idoate, S.J. · Universidad Centroamericana José Simeón Cañas (UCA), El Salvador
      </footer>

      {/* Modal de Selector / Creador de Año */}
      <YearSelectorModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        onCloneYear={handleCloneYear}
        onDeleteYear={handleDeleteYear}
        yearDataMap={yearDataMap}
      />

      {/* Modal de Importación Asistida */}
      {yearData && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          yearData={yearData}
          onApplyImport={handleApplyImport}
          defaultTargetSection={importDefaultSection}
        />
      )}

      {/* Notificación Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
