import React, { useState } from 'react';
import { CabeceraSIU } from '../../types';
import { Building2, User, Mail, Users, Edit3, Check } from 'lucide-react';

interface SIUHeaderProps {
  cabecera: CabeceraSIU;
  onChange: (updated: CabeceraSIU) => void;
  year: number;
}

export const SIUHeader: React.FC<SIUHeaderProps> = ({ cabecera, onChange, year }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CabeceraSIU>(cabecera);

  const handleSave = () => {
    onChange({ ...formData, ano: year });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#234a80] dark:text-[#9bc2f7]" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Ficha Institucional SIU - Año {year}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#234a80] dark:text-[#9bc2f7] bg-[#234a80]/10 hover:bg-[#234a80]/20 dark:bg-[#234a80]/25 dark:hover:bg-[#234a80]/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guardar Ficha</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5 text-[#e06d26]" />
              <span>Editar Datos de Ficha</span>
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Unidad Responsable:
            </label>
            <input
              type="text"
              value={formData.unidad}
              onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Jefatura(s):</label>
            <input
              type="text"
              value={formData.jefaturas}
              onChange={(e) => setFormData({ ...formData, jefaturas: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo(s) de Jefatura:
            </label>
            <input
              type="text"
              value={formData.correosJefaturas}
              onChange={(e) => setFormData({ ...formData, correosJefaturas: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Persona Enlace:</label>
            <input
              type="text"
              value={formData.personaEnlace}
              onChange={(e) => setFormData({ ...formData, personaEnlace: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Enlace:</label>
            <input
              type="text"
              value={formData.correoEnlace}
              onChange={(e) => setFormData({ ...formData, correoEnlace: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Unidad Reportante:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{cabecera.unidad}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Jefatura(s):</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{cabecera.jefaturas}</span>
            </div>
            <span className="text-[11px] text-slate-500">{cabecera.correosJefaturas}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Persona Enlace:</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{cabecera.personaEnlace}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Contacto Oficial:</span>
            <div className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>{cabecera.correoEnlace}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
