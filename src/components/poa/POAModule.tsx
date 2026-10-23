import React, { useState } from 'react';
import { POAData } from '../../types';
import { POAPresupuesto } from './POAPresupuesto';
import { POAPublicaciones } from './POAPublicaciones';
import { POADepositos } from './POADepositos';
import { POAAdopcion } from './POAAdopcion';
import { POASubactividades } from './POASubactividades';
import { POAPerfiles } from './POAPerfiles';
import { POAAnalisis } from './POAAnalisis';
import { DollarSign, BookOpen, Calendar, Users, ListTodo, Eye, FileText, Upload } from 'lucide-react';

interface POAModuleProps {
  poaData: POAData;
  onChange: (updated: POAData, sectionName: string) => void;
  year: number;
  onOpenImport: (defaultSection: string) => void;
}

export const POAModule: React.FC<POAModuleProps> = ({ poaData, onChange, year, onOpenImport }) => {
  const [activeTab, setActiveTab] = useState<'1.1' | '1.2' | '1.3' | '1.4' | '1.5' | '1.6' | '1.7'>('1.2');

  const tabs = [
    { id: '1.1', label: '1.1 Presupuesto', icon: DollarSign, section: 'poa_presupuesto' },
    { id: '1.2', label: '1.2 Publicaciones', icon: BookOpen, section: 'poa_publicaciones' },
    { id: '1.3', label: '1.3 Depósitos Mensuales', icon: Calendar, section: 'poa_depositos' },
    { id: '1.4', label: '1.4 Adopción', icon: Users, section: 'poa_adopcion' },
    { id: '1.5', label: '1.5 Subactividades', icon: ListTodo, section: 'poa_subactividades' },
    { id: '1.6', label: '1.6 Perfiles Más Vistos', icon: Eye, section: 'poa_perfiles' },
    { id: '1.7', label: '1.7 Análisis Cualitativo', icon: FileText, section: 'poa_analisis' },
  ] as const;

  const currentTabObj = tabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header del Módulo POA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#234a80] dark:text-[#9bc2f7] mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e06d26]" />
            <span>Plan Operativo Anual (POA)</span>
            <span>·</span>
            <span>Línea Micelio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sistema CRIS e Investigaciones UCA
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Seguimiento de metas, presupuesto asignado, publicaciones y análisis cualitativo para el año {year}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenImport(currentTabObj?.section || 'poa_publicaciones')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#e06d26]" />
            <span>Importar datos a esta sección</span>
          </button>
        </div>
      </div>

      {/* Barra de Sub-pestañas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#234a80] text-white shadow-xs font-semibold border border-[#234a80]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-[#234a80]/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e06d26]' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de la Subsección activa */}
      <div>
        {activeTab === '1.1' && (
          <POAPresupuesto
            items={poaData.presupuesto}
            onChange={(items) => onChange({ ...poaData, presupuesto: items }, '1.1 Presupuesto')}
            year={year}
          />
        )}

        {activeTab === '1.2' && (
          <POAPublicaciones
            items={poaData.publicaciones}
            onChange={(items) => onChange({ ...poaData, publicaciones: items }, '1.2 Publicaciones')}
            year={year}
          />
        )}

        {activeTab === '1.3' && (
          <POADepositos
            depositos={poaData.depositosMensuales}
            onChange={(dep) => onChange({ ...poaData, depositosMensuales: dep }, '1.3 Depósitos Mensuales')}
            year={year}
          />
        )}

        {activeTab === '1.4' && (
          <POAAdopcion
            adopcion={poaData.adopcion}
            onChange={(adop) => onChange({ ...poaData, adopcion: adop }, '1.4 Adopción')}
            year={year}
          />
        )}

        {activeTab === '1.5' && (
          <POASubactividades
            items={poaData.subactividades}
            onChange={(items) => onChange({ ...poaData, subactividades: items }, '1.5 Subactividades')}
            year={year}
          />
        )}

        {activeTab === '1.6' && (
          <POAPerfiles
            items={poaData.visibilidadPerfiles}
            onChange={(items) => onChange({ ...poaData, visibilidadPerfiles: items }, '1.6 Perfiles Más Vistos')}
            year={year}
          />
        )}

        {activeTab === '1.7' && (
          <POAAnalisis
            analisis={poaData.analisisCualitativo}
            onChange={(analisis) => onChange({ ...poaData, analisisCualitativo: analisis }, '1.7 Análisis Cualitativo')}
            year={year}
          />
        )}
      </div>
    </div>
  );
};
