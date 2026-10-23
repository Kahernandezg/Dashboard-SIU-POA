import React, { useState } from 'react';
import { SIUData, POAData } from '../../types';
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
} from 'lucide-react';

interface SIUModuleProps {
  siuData: SIUData;
  poaData: POAData;
  onChange: (updated: SIUData, sectionName: string) => void;
  onSyncMicelioWithPOA: () => void;
  year: number;
  onOpenImport: (defaultSection: string) => void;
}

export const SIUModule: React.FC<SIUModuleProps> = ({
  siuData,
  poaData,
  onChange,
  onSyncMicelioWithPOA,
  year,
  onOpenImport,
}) => {
  const [activeSection, setActiveSection] = useState<string>('2.3');

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

  const currentSecObj = sections.find((s) => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo SIU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#234a80] dark:text-[#9bc2f7] mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e06d26]" />
            <span>Sistema Integrado de Información Universitaria (SIU)</span>
            <span>·</span>
            <span>CRAI UCA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Libro de Indicadores SIU_CRAI — Ejercicio {year}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Registro estructurado de las 18 secciones del informe institucional para acreditación y rendición de cuentas.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Ficha Institucional de Cabecera */}
      <SIUHeader
        cabecera={siuData.cabecera}
        onChange={(cab) => onChange({ ...siuData, cabecera: cab }, 'Cabecera Institucional')}
        year={year}
      />

      {/* Selector Desplazable de las 18 Secciones */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#234a80] text-white shadow-xs font-semibold border border-[#234a80]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-[#234a80]/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e06d26]' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{sec.name}</span>
            </button>
          );
        })}
      </div>

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
