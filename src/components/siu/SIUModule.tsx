import React, { useState, useEffect } from 'react';
import { SIUData, POAData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SIUHeader } from './SIUHeader';
import { S20_ControlReportes } from './sections/S20_ControlReportes';
import { S21_FormacionPersonal } from './sections/S21_FormacionPersonal';
import { S22_PlanMejora } from './sections/S22_PlanMejora';
import { S23_RecursosElectronicos } from './sections/S23_RecursosElectronicos';
import { S24_VisitasObras } from './sections/S24_VisitasObras';
import { S25_PortalRevistas } from './sections/S25_PortalRevistas';
import { S26_RepositorioRIUCA } from './sections/S26_RepositorioRIUCA';
import { S27_Micelio } from './sections/S27_Micelio';
import { S28_DesarrolloColecciones } from './sections/S28_DesarrolloColecciones';
import { S29_AcervosHistoricos } from './sections/S29_AcervosHistoricos';
import { S210_CatalogadoKoha } from './sections/S210_CatalogadoKoha';
import { S211_Atom } from './sections/S211_Atom';
import { S212_PropiedadIntelectual } from './sections/S212_PropiedadIntelectual';
import { S213_Comunicaciones } from './sections/S213_Comunicaciones';
import { S214_AgendaCultural } from './sections/S214_AgendaCultural';
import { S215_FormacionesUsuarios } from './sections/S215_FormacionesUsuarios';
import { S216_IngresosServicios } from './sections/S216_IngresosServicios';
import { S217_SeguridadSalud } from './sections/S217_SeguridadSalud';
import { S218_Definiciones } from './sections/S218_Definiciones';
import {
  FileText,
  GraduationCap,
  Target,
  Database,
  Users,
  BookOpen,
  Archive,
  Globe,
  Layers,
  History,
  CheckCircle,
  FolderArchive,
  Bookmark,
  Share2,
  Sparkles,
  DollarSign,
  ShieldAlert,
  BookA,
  Upload,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface SIUModuleProps {
  siuData: SIUData;
  poaData: POAData;
  onChange: (updated: SIUData, sectionName: string) => void;
  onSyncMicelioWithPOA: () => void;
  year: number;
  onOpenImport: (defaultSection: string) => void;
}

const ALL_SECTION_IDS = [
  '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8',
  '2.9', '2.10', '2.11', '2.12', '2.13', '2.14', '2.15', '2.16', '2.17', '2.18'
];

export const SIUModule: React.FC<SIUModuleProps> = ({
  siuData,
  poaData,
  onChange,
  onSyncMicelioWithPOA,
  year,
  onOpenImport,
}) => {
  const { isSuperAdmin, currentEmail } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('2.3');
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [previewAsUser, setPreviewAsUser] = useState<boolean>(false);

  // Recuperar configuración persistida de hojas activas desde localStorage
  const getStoredActiveSections = (): string[] | null => {
    try {
      const raw = localStorage.getItem('crai_siu_secciones_activas');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error leyendo crai_siu_secciones_activas:', e);
    }
    return null;
  };

  // Lista de hojas activas persistidas:
  // 1. siuData.seccionesActivas si existe y tiene datos
  // 2. o el valor guardado en localStorage
  // 3. o por defecto todas las secciones
  const storedSections = getStoredActiveSections();
  const activeSectionIds: string[] =
    siuData.seccionesActivas && siuData.seccionesActivas.length > 0
      ? siuData.seccionesActivas
      : storedSections || ALL_SECTION_IDS;

  // Sincronizar al montar con el servidor y localStorage
  useEffect(() => {
    // Si localStorage tiene una selección previa pero siuData aún no la tenía, aplicarla
    if (storedSections && (!siuData.seccionesActivas || siuData.seccionesActivas.length === 0)) {
      onChange(
        { ...siuData, seccionesActivas: storedSections },
        'Sincronización de hojas activas desde preferencias guardadas'
      );
    }

    // Consultar al servidor para sincronizar entre diferentes usuarios y navegadores
    fetch('/api/settings/active-sections')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.activeSections) && data.activeSections.length > 0) {
          try {
            localStorage.setItem('crai_siu_secciones_activas', JSON.stringify(data.activeSections));
          } catch (e) {
            console.error(e);
          }
          if (JSON.stringify(data.activeSections) !== JSON.stringify(siuData.seccionesActivas)) {
            onChange(
              { ...siuData, seccionesActivas: data.activeSections },
              'Sincronización de hojas activas desde servidor'
            );
          }
        }
      })
      .catch((err) => console.warn('No se pudo sincronizar hojas activas con servidor:', err));
  }, []);

  const sections = [
    { id: '2.0', name: '2.0 Control Reportes', icon: FileText, importKey: 'siu_control' },
    { id: '2.1', name: '2.1 Formación Personal', icon: GraduationCap, importKey: 'siu_formacion' },
    { id: '2.2', name: '2.2 Plan de Mejora CdA', icon: Target, importKey: 'siu_plan_mejora' },
    { id: '2.3', name: '2.3 Recursos Electrónicos', icon: Database, importKey: 'siu_recursos' },
    { id: '2.4', name: '2.4 Visitas y Obras', icon: Users, importKey: 'siu_visitas' },
    { id: '2.5', name: '2.5 Portal de Revistas', icon: BookOpen, importKey: 'siu_revistas' },
    { id: '2.6', name: '2.6 Repositorio RIUCA', icon: Archive, importKey: 'siu_riuca' },
    { id: '2.7', name: '2.7 Micelio Repositorio', icon: Globe, importKey: 'siu_micelio' },
    { id: '2.8', name: '2.8 Desarrollo Colecciones', icon: Layers, importKey: 'siu_colecciones' },
    { id: '2.9', name: '2.9 Acervos Históricos', icon: History, importKey: 'siu_acervos' },
    { id: '2.10', name: '2.10 Catalogado KOHA', icon: CheckCircle, importKey: 'siu_koha' },
    { id: '2.11', name: '2.11 ATOM y DSpace', icon: FolderArchive, importKey: 'siu_atom' },
    { id: '2.12', name: '2.12 Propiedad Intelectual', icon: Bookmark, importKey: 'siu_propiedad' },
    { id: '2.13', name: '2.13 Comunicaciones', icon: Share2, importKey: 'siu_comunicaciones' },
    { id: '2.14', name: '2.14 Agenda Cultural', icon: Sparkles, importKey: 'siu_cultural' },
    { id: '2.15', name: '2.15 Formaciones Usuarios', icon: GraduationCap, importKey: 'siu_formacion_usuarios' },
    { id: '2.16', name: '2.16 Ingresos Servicios', icon: DollarSign, importKey: 'siu_ingresos' },
    { id: '2.17', name: '2.17 Seguridad y Salud', icon: ShieldAlert, importKey: 'siu_seguridad' },
    { id: '2.18', name: '2.18 Definiciones MINED', icon: BookA, importKey: 'siu_definiciones' },
  ];

  // Determinar qué secciones mostrar en la barra de navegación:
  // - Superadmin sin vista previa: Ve todas las 19 secciones (con indicador en las inactivas)
  // - Usuarios estándar (o Superadmin en vista previa): SOLO ven las secciones activas
  const isEffectiveSuperAdmin = isSuperAdmin && !previewAsUser;
  const visibleSections = isEffectiveSuperAdmin
    ? sections
    : sections.filter((s) => activeSectionIds.includes(s.id));

  // Redirigir si la sección actual no está visible para el usuario estándar
  useEffect(() => {
    if (!isEffectiveSuperAdmin) {
      if (!activeSectionIds.includes(activeSection)) {
        const firstActive = sections.find((s) => activeSectionIds.includes(s.id));
        if (firstActive) {
          setActiveSection(firstActive.id);
        }
      }
    }
  }, [isEffectiveSuperAdmin, activeSectionIds, activeSection]);

  // Guardar en todas las capas (siuData, localStorage y servidor)
  const persistActiveSections = (updated: string[], actionDesc: string) => {
    try {
      localStorage.setItem('crai_siu_secciones_activas', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    fetch('/api/settings/active-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeSections: updated }),
    }).catch((e) => console.warn('Error guardando hojas activas en servidor:', e));

    onChange({ ...siuData, seccionesActivas: updated }, actionDesc);
  };

  // Manejar activación / desactivación de una sección
  const handleToggleSection = (secId: string) => {
    if (!isSuperAdmin) return;
    const isCurrentlyActive = activeSectionIds.includes(secId);
    let updated: string[];
    if (isCurrentlyActive) {
      if (activeSectionIds.length <= 1) {
        alert('Debe permanecer al menos una hoja de trabajo activa en el informe.');
        return;
      }
      updated = activeSectionIds.filter((id) => id !== secId);
    } else {
      updated = [...activeSectionIds, secId].sort((a, b) => {
        const idxA = ALL_SECTION_IDS.indexOf(a);
        const idxB = ALL_SECTION_IDS.indexOf(b);
        return idxA - idxB;
      });
    }

    persistActiveSections(
      updated,
      `Gestión de Hojas de Trabajo SIU (${isCurrentlyActive ? 'Desactivó' : 'Activó'} ${secId})`
    );
  };

  // Activar todas las hojas
  const handleActivateAll = () => {
    if (!isSuperAdmin) return;
    persistActiveSections([...ALL_SECTION_IDS], 'Gestión de Hojas de Trabajo SIU (Activó todas las hojas)');
  };

  // Desactivar todas excepto las esenciales
  const handleDeactivateExceptEssential = () => {
    if (!isSuperAdmin) return;
    const essential = ['2.0', '2.3', '2.5', '2.7'];
    persistActiveSections(essential, 'Gestión de Hojas de Trabajo SIU (Filtro rápido esenciales)');
  };

  const currentSecObj = sections.find((s) => s.id === activeSection);
  const isCurrentSectionActive = activeSectionIds.includes(activeSection);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo SIU */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#234a80] dark:text-[#9bc2f7] mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e06d26]" />
            <span>Sistema Integrado de Información Universitaria (SIU)</span>
            <span>·</span>
            <span>CRAI UCA</span>
            {isSuperAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Superadmin ({currentEmail})
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Libro de Indicadores SIU_CRAI — Ejercicio {year}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Registro estructurado de las 18 secciones del informe institucional para acreditación y rendición de cuentas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de Gestión Exclusivos del Superadmin kahernandezg@uca.edu.sv */}
          {isSuperAdmin && (
            <>
              <button
                type="button"
                onClick={() => setShowManageModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                title="Activar o desactivar hojas de trabajo para los demás usuarios"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Gestionar Hojas ({activeSectionIds.length}/19 activas)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewAsUser(!previewAsUser)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer shadow-2xs ${
                  previewAsUser
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
                title="Alternar entre vista de superadmin y vista estándar para otros usuarios"
              >
                {previewAsUser ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Salir de Vista Usuario</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vista Usuario</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Estado de Hojas para Usuarios Estándar */}
          {!isSuperAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeSectionIds.length} hojas habilitadas</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => onOpenImport(currentSecObj?.importKey || 'siu_recursos')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#e06d26]" />
            <span>Importar datos a esta sección</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo cuando el Superadmin está en Vista Previa */}
      {previewAsUser && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              <strong>Modo Vista de Usuario activo:</strong> Estás previsualizando la vista de otros usuarios (ej. <code>adiaz@uca.edu.sv</code>, <code>scampos@uca.edu.sv</code>, <code>gihernandez@uca.edu.sv</code>). Las hojas desactivadas están completamente ocultas.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPreviewAsUser(false)}
            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 rounded-md transition-colors cursor-pointer shrink-0 ml-3"
          >
            Volver a modo Superadmin
          </button>
        </div>
      )}

      {/* Ficha Institucional de Cabecera */}
      <SIUHeader
        cabecera={siuData.cabecera}
        onChange={(cab) => onChange({ ...siuData, cabecera: cab }, 'Cabecera Institucional')}
        year={year}
      />

      {/* Selector Desplazable de Secciones Habilitadas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {visibleSections.map((sec) => {
          const Icon = sec.icon;
          const isActiveTab = activeSection === sec.id;
          const isSectionEnabled = activeSectionIds.includes(sec.id);

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActiveTab
                  ? 'bg-[#234a80] text-white shadow-xs font-semibold border border-[#234a80]'
                  : isSectionEnabled
                  ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-[#234a80]/30'
                  : 'bg-slate-100/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActiveTab
                    ? 'text-[#e06d26]'
                    : isSectionEnabled
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              />
              <span>{sec.name}</span>

              {/* Indicador exclusivo para Superadmin cuando una hoja está desactivada */}
              {isEffectiveSuperAdmin && !isSectionEnabled && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  <EyeOff className="w-2.5 h-2.5" />
                  <span>Oculta</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Aviso para el Superadmin si está posicionado en una hoja desactivada */}
      {isEffectiveSuperAdmin && !isCurrentSectionActive && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Hoja desactivada para usuarios:</strong> La sección <code>{currentSecObj?.name}</code> está actualmente oculta para los demás usuarios (adiaz, scampos, gihernandez). Puedes editarla y activarla cuando lo desees.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleToggleSection(activeSection)}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors cursor-pointer shrink-0 ml-3 shadow-2xs"
          >
            Activar para todos
          </button>
        </div>
      )}

      {/* Modal de Gestión de Visibilidad de Hojas (Superadmin kahernandezg@uca.edu.sv) */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Cabecera del modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Gestor de Visibilidad de Hojas de Trabajo SIU
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">
                      SUPERADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Activa o desactiva qué hojas del informe SIU CRAI estarán disponibles para consulta por los demás usuarios institucionalmente (<code>adiaz@uca.edu.sv</code>, <code>scampos@uca.edu.sv</code>, <code>gihernandez@uca.edu.sv</code>, etc.).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Acciones Masivas */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Estado: <span className="text-[#234a80] dark:text-[#9bc2f7] font-bold">{activeSectionIds.length}</span> de {sections.length} hojas activas
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleActivateAll}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                >
                  Activar Todas (19)
                </button>
                <button
                  type="button"
                  onClick={handleDeactivateExceptEssential}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Solo Esenciales (4)
                </button>
              </div>
            </div>

            {/* Lista de Secciones con Toggles */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isEnabled = activeSectionIds.includes(sec.id);

                return (
                  <div
                    key={sec.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isEnabled
                        ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isEnabled
                            ? 'bg-[#234a80]/10 text-[#234a80] dark:text-[#9bc2f7]'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {sec.name}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isEnabled
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isEnabled ? 'Activa para usuarios' : 'Desactivada / Oculta'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isEnabled
                            ? 'Visible para todos los usuarios y jefaturas del CRAI'
                            : 'Solo visible para ti como superadmin'}
                        </p>
                      </div>
                    </div>

                    {/* Switch interactivo */}
                    <button
                      type="button"
                      onClick={() => handleToggleSection(sec.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={isEnabled}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Los cambios se guardan y sincronizan automáticamente.
              </span>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Cerrar Gestor
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Sección Activa */}
      <div>
        {activeSection === '2.0' && (
          <S20_ControlReportes
            reportes={siuData.controlReportes}
            onChange={(items) => onChange({ ...siuData, controlReportes: items }, '2.0 Control de Reportes')}
            year={year}
          />
        )}

        {activeSection === '2.1' && (
          <S21_FormacionPersonal
            items={siuData.s21_formacion}
            onChange={(items) => onChange({ ...siuData, s21_formacion: items }, '2.1 Formación del Personal')}
            year={year}
          />
        )}

        {activeSection === '2.2' && (
          <S22_PlanMejora
            items={siuData.s22_planMejora}
            onChange={(items) => onChange({ ...siuData, s22_planMejora: items }, '2.2 Plan de Mejora CdA')}
            year={year}
          />
        )}

        {activeSection === '2.3' && (
          <S23_RecursosElectronicos
            recursos={siuData.s23_recursosElectronicos}
            onChange={(items) => onChange({ ...siuData, s23_recursosElectronicos: items }, '2.3 Recursos Electrónicos')}
            year={year}
          />
        )}

        {activeSection === '2.4' && (
          <S24_VisitasObras
            data={siuData.s24_visitasObras}
            onChange={(v) => onChange({ ...siuData, s24_visitasObras: v }, '2.4 Visitas y Obras Consultadas')}
            year={year}
          />
        )}

        {activeSection === '2.5' && (
          <S25_PortalRevistas
            data={siuData.s25_portalRevistas}
            onChange={(p) => onChange({ ...siuData, s25_portalRevistas: p }, '2.5 Portal de Revistas OJS')}
            year={year}
          />
        )}

        {activeSection === '2.6' && (
          <S26_RepositorioRIUCA
            data={siuData.s26_repositorioRIUCA}
            onChange={(r) => onChange({ ...siuData, s26_repositorioRIUCA: r }, '2.6 Repositorio RIUCA')}
            year={year}
          />
        )}

        {activeSection === '2.7' && (
          <S27_Micelio
            data={siuData.s27_micelio}
            poaData={poaData}
            onChange={(m) => onChange({ ...siuData, s27_micelio: m }, '2.7 Micelio Repositorio')}
            onSyncWithPOA={onSyncMicelioWithPOA}
            year={year}
          />
        )}

        {activeSection === '2.8' && (
          <S28_DesarrolloColecciones
            items={siuData.s28_desarrolloColecciones}
            onChange={(items) => onChange({ ...siuData, s28_desarrolloColecciones: items }, '2.8 Desarrollo de Colecciones')}
            year={year}
          />
        )}

        {activeSection === '2.9' && (
          <S29_AcervosHistoricos
            items={siuData.s29_acervosHistoricos}
            onChange={(items) => onChange({ ...siuData, s29_acervosHistoricos: items }, '2.9 Acervos Históricos')}
            year={year}
          />
        )}

        {activeSection === '2.10' && (
          <S210_CatalogadoKoha
            data={siuData.s210_catalogadoKoha}
            onChange={(k) => onChange({ ...siuData, s210_catalogadoKoha: k }, '2.10 Catalogado KOHA')}
            year={year}
          />
        )}

        {activeSection === '2.11' && (
          <S211_Atom
            data={siuData.s211_atom}
            onChange={(a) => onChange({ ...siuData, s211_atom: a }, '2.11 ATOM y DSpace')}
            year={year}
          />
        )}

        {activeSection === '2.12' && (
          <S212_PropiedadIntelectual
            items={siuData.s212_propiedadIntelectual}
            onChange={(items) => onChange({ ...siuData, s212_propiedadIntelectual: items }, '2.12 Propiedad Intelectual')}
            year={year}
          />
        )}

        {activeSection === '2.13' && (
          <S213_Comunicaciones
            items={siuData.s213_comunicaciones}
            onChange={(items) => onChange({ ...siuData, s213_comunicaciones: items }, '2.13 Comunicaciones y Redes')}
            year={year}
          />
        )}

        {activeSection === '2.14' && (
          <S214_AgendaCultural
            data={siuData.s214_agendaCultural}
            onChange={(a) => onChange({ ...siuData, s214_agendaCultural: a }, '2.14 Agenda Cultural')}
            year={year}
          />
        )}

        {activeSection === '2.15' && (
          <S215_FormacionesUsuarios
            data={siuData.s215_formacionesUsuarios}
            onChange={(f) => onChange({ ...siuData, s215_formacionesUsuarios: f }, '2.15 Formaciones a Usuarios')}
            year={year}
          />
        )}

        {activeSection === '2.16' && (
          <S216_IngresosServicios
            items={siuData.s216_ingresosServicios}
            onChange={(items) => onChange({ ...siuData, s216_ingresosServicios: items }, '2.16 Ingresos por Servicios')}
            year={year}
          />
        )}

        {activeSection === '2.17' && (
          <S217_SeguridadSalud
            data={siuData.s217_seguridadSalud}
            onChange={(s) => onChange({ ...siuData, s217_seguridadSalud: s }, '2.17 Seguridad y Salud')}
            year={year}
          />
        )}

        {activeSection === '2.18' && (
          <S218_Definiciones
            items={siuData.s218_definiciones}
            onChange={(items) => onChange({ ...siuData, s218_definiciones: items }, '2.18 Catálogo de Definiciones')}
            year={year}
          />
        )}
      </div>
    </div>
  );
};
