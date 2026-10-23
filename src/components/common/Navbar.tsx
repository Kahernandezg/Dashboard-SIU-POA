import React, { useState } from 'react';
import { Calendar, Sun, Moon, CheckCircle2, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { ExportMenu } from './ExportMenu';
import { YearData } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeModule: 'inicio' | 'poa' | 'siu' | 'config';
  onSelectModule: (mod: 'inicio' | 'poa' | 'siu' | 'config') => void;
  selectedYear: number;
  yearData: YearData | null;
  onOpenYearModal: () => void;
  isSaving?: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  currentSectionData?: { title: string; rows: any[][] };
  currentSectionId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  selectedYear,
  yearData,
  onOpenYearModal,
  isSaving = false,
  isDark,
  onToggleDark,
  currentSectionData,
  currentSectionId,
}) => {
  const { user, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Barra superior de acento institucional UCA */}
      <div className="h-1 w-full bg-linear-to-r from-[#234a80] via-[#234a80] to-[#e06d26]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zona 1: Brand Wordmark Institucional */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectModule('inicio')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-[#234a80] text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-xs border-b-2 border-[#e06d26] transition-transform group-hover:scale-105">
              UCA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                CRAI <span className="text-[#e06d26]">UCA</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                POA & SIU
              </span>
            </div>
          </button>
        </div>

        {/* Zona 2: Enlaces de Navegación Primaria */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => onSelectModule('inicio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'inicio'
                ? 'bg-[#234a80] text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => onSelectModule('poa')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'poa'
                ? 'bg-[#234a80] text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            POA Micelio
          </button>
          <button
            type="button"
            onClick={() => onSelectModule('siu')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'siu'
                ? 'bg-[#234a80] text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            SIU CRAI
          </button>
          <button
            type="button"
            onClick={() => onSelectModule('config')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'config'
                ? 'bg-[#234a80] text-white font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Configuración
          </button>
        </nav>

        {/* Zona 3: Selector de Año, Indicador de Guardado y Acciones */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Indicador de persistencia */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {isSaving ? (
              <span className="text-[#e06d26] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e06d26] animate-ping" />
                Guardando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            )}
          </div>

          {/* Selector de Año Global */}
          <button
            type="button"
            onClick={onOpenYearModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Cambiar o crear nuevo año de informes"
          >
            <Calendar className="w-3.5 h-3.5 text-[#e06d26]" />
            <span className="font-mono tabular-nums">{selectedYear}</span>
          </button>

          {/* Menú de exportación */}
          {yearData && (
            <ExportMenu
              yearData={yearData}
              activeModule={activeModule}
              currentSectionId={currentSectionId}
              currentSectionData={currentSectionData}
            />
          )}

          {/* Autenticación Google Firebase & Cloud SQL */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors text-xs font-medium cursor-pointer"
                title={user.email || 'Usuario conectado'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuario'}
                    className="w-5 h-5 rounded-full object-cover border border-[#234a80]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#234a80] text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate text-slate-800 dark:text-slate-200 text-[11px] hidden sm:inline">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Usuario UCA'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOutUser();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-white bg-[#234a80] hover:bg-[#1b3b66] border border-[#234a80] transition-colors cursor-pointer shadow-2xs"
              title="Iniciar sesión con Google para sincronizar perfiles de investigación"
            >
              <LogIn className="w-3.5 h-3.5 text-[#e06d26]" />
              <span className="hidden sm:inline">Acceder</span>
            </button>
          )}

          {/* Toggle Modo Oscuro / Claro interactivo con texto y contraste */}
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={isDark ? 'Cambiar a tema claro (blanco)' : 'Cambiar a tema oscuro'}
            title={isDark ? 'Cambiar a tema claro (blanco)' : 'Cambiar a tema oscuro'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer shadow-2xs"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#234a80]" />
                <span className="hidden sm:inline text-[11px]">Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
