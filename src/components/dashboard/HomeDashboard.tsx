import React, { useState } from 'react';
import { YearData, MESES_CORTO } from '../../types';
import { KPICard } from '../common/KPICard';
import { PlotlyChart } from '../common/PlotlyChart';
import {
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Database,
  Users,
  BookOpen,
  Copy,
  Printer,
} from 'lucide-react';

interface HomeDashboardProps {
  yearData: YearData;
  onNavigate: (module: 'poa' | 'siu' | 'config') => void;
  onOpenYearModal: () => void;
  year: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  yearData,
  onNavigate,
  onOpenYearModal,
  year,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'anual' | 'semestre1' | 'semestre2'>('anual');

  // Cálculos de POA
  const totPresupuesto = yearData.poa.presupuesto.reduce((a, b) => a + (Number(b.monto) || 0), 0);
  const totPubProy = yearData.poa.publicaciones.reduce((a, b) => a + (Number(b.proyeccionActual) || 0), 0);
  const totPubObs = yearData.poa.publicaciones.reduce((a, b) => a + (Number(b.resultadosActual) || 0), 0);
  const avancePOA = totPubProy > 0 ? (totPubObs / totPubProy) * 100 : 0;

  // Cálculos de SIU
  const totVisitasFisicas =
    yearData.siu.s24_visitasObras.visitasHombres.reduce((a, b) => a + b, 0) +
    yearData.siu.s24_visitasObras.visitasMujeres.reduce((a, b) => a + b, 0);
  const totObrasConsultadas = yearData.siu.s24_visitasObras.obrasConsultadas.reduce((a, b) => a + b, 0);
  const totConsultasElectronicas = yearData.siu.s23_recursosElectronicos.reduce(
    (acc, r) => acc + r.meses.reduce((a, b) => a + b, 0),
    0
  );
  const totInversionColecciones = yearData.siu.s28_desarrolloColecciones.reduce(
    (a, b) => a + (Number(b.costo) || 0),
    0
  );

  // Estado y avance de captura global
  let totalCamposEsperados = 35;
  let camposConDatos = 0;
  if (totPresupuesto > 0) camposConDatos += 5;
  if (totPubObs > 0) camposConDatos += 5;
  if (yearData.poa.visibilidadPerfiles.length > 0) camposConDatos += 5;
  if (totConsultasElectronicas > 0) camposConDatos += 5;
  if (totVisitasFisicas > 0) camposConDatos += 5;
  if (yearData.siu.s26_repositorioRIUCA.documentos.length > 0) camposConDatos += 5;
  if (yearData.poa.analisisCualitativo.semestre1.logro) camposConDatos += 5;

  const pctCapturaGlobal = Math.min(100, Math.round((camposConDatos / totalCamposEsperados) * 100));

  // Gráfico Comparativo Interanual de Recursos Electrónicos
  const monthlyCurrent = new Array(12).fill(0);
  yearData.siu.s23_recursosElectronicos.forEach((r) =>
    r.meses.forEach((val, idx) => (monthlyCurrent[idx] += Number(val) || 0))
  );

  const interanualChartData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: monthlyCurrent,
      name: `Consultas Recursos (${year})`,
      type: 'bar',
      marker: { color: '#234a80' },
    },
    {
      x: [...MESES_CORTO],
      y: yearData.siu.s24_visitasObras.obrasConsultadas,
      name: `Obras Físicas Consultadas (${year})`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#e06d26', width: 2.5 },
      marker: { size: 6, color: '#e06d26' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Resumen Ejecutivo Institucional UCA */}
      <div className="relative overflow-hidden bg-linear-to-r from-[#172e50] via-[#234a80] to-[#1a3861] border border-[#234a80]/60 rounded-2xl p-6 text-white shadow-lg">
        {/* Franja superior institucional naranja */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#e06d26] via-[#f59e0b] to-[#e06d26]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
              <span className="px-2 py-0.5 rounded-sm bg-[#e06d26] text-white text-[10px] tracking-wider uppercase font-bold">
                CRAI UCA
              </span>
              <span>·</span>
              <span>Panel de Control Institucional</span>
              <span>·</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px]">{year}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Centro de Recursos para el Aprendizaje y la Investigación
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consolidación y auditoría de indicadores para el <strong>Plan Operativo Anual (POA Micelio)</strong> y el{' '}
              <strong>Sistema Integrado de Información Universitaria (SIU_CRAI)</strong> de la Universidad Centroamericana José Simeón Cañas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenYearModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white text-[#234a80] hover:bg-slate-100 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#e06d26]" />
              <span>Clonar nuevo año ({year + 1})</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Barra de Progreso de Captura Global */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-blue-100 font-medium">Avance de captura y validación {year}:</span>
            <span className="font-mono font-bold text-[#f59e0b]">{pctCapturaGlobal}% completado</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-[#e06d26] to-[#f59e0b] h-full rounded-full transition-all duration-500"
              style={{ width: `${pctCapturaGlobal}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selector de Filtro Temporal */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setPeriodFilter('anual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              periodFilter === 'anual'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Vista Anual Completa
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('semestre1')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              periodFilter === 'semestre1'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Semestre 1 (Ene - Jun)
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('semestre2')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              periodFilter === 'semestre2'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Semestre 2 (Jul - Dic)
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          Última actualización: {new Date(yearData.lastModified).toLocaleDateString('es-SV')}
        </div>
      </div>

      {/* Tarjetas Principales por Módulo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta Módulo POA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#234a80] dark:text-[#9bc2f7] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e06d26]" />
                Módulo 1
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                En seguimiento
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              POA — Línea Micelio ({year})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Seguimiento operativo del repositorio de investigaciones, metas de publicaciones y adopción de perfiles.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Presupuesto</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  ${totPresupuesto.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Publicaciones</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {totPubObs} / {totPubProy}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">% Avance</span>
                <span className="font-mono font-bold text-sm text-[#e06d26]">
                  {avancePOA.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('poa')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-xl transition-colors shadow-xs cursor-pointer border border-[#234a80]"
          >
            <span>Abrir Módulo POA</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#e06d26]" />
          </button>
        </div>

        {/* Tarjeta Módulo SIU */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#234a80] dark:text-[#9bc2f7] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#234a80]" />
                Módulo 2
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#234a80] dark:bg-blue-950/60 dark:text-[#9bc2f7]">
                18 Secciones Oficiales
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              SIU — Sistema Integrado CRAI ({year})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Libro oficial para acreditación: visitas físicas, recursos electrónicos, revistas OJS, RIUCA e inversión.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Visitas Físicas</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {totVisitasFisicas.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Consultas Elect.</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {totConsultasElectronicas.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Inversión BD</span>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  ${totInversionColecciones.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('siu')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-xl transition-colors shadow-xs cursor-pointer border border-[#234a80]"
          >
            <span>Abrir Módulo SIU</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#e06d26]" />
          </button>
        </div>
      </div>

      {/* KPIs Transversales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Uso de Recursos Electrónicos"
          value={totConsultasElectronicas}
          subtitle={`Consultas a bases de datos (${year})`}
          meta="EBSCO, JSTOR, E-Libro, ASTM"
          icon={Database}
        />
        <KPICard
          title="Visitas Físicas en Sala"
          value={totVisitasFisicas}
          subtitle="Afluencia a salas del CRAI"
          meta={`${yearData.siu.s24_visitasObras.visitasMujeres.reduce((a, b) => a + b, 0).toLocaleString()} mujeres`}
          icon={Users}
        />
        <KPICard
          title="Obras Físicas Consultadas"
          value={totObrasConsultadas}
          subtitle="Circulación y sala"
          meta="Material bibliográfico"
          icon={BookOpen}
        />
        <KPICard
          title="Inversión en Colecciones"
          value={`$${totInversionColecciones.toLocaleString()}`}
          subtitle="Bases de datos y suscripciones"
          meta="Fondos institucionales"
          icon={Award}
        />
      </div>

      {/* Gráfico Comparativo Interanual */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Tendencia de Consumo Académico: Físico vs Electrónico ({year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlación mensual entre consultas electrónicas en bases de datos y préstamos de obras físicas
            </p>
          </div>
        </div>
        <PlotlyChart
          data={interanualChartData}
          layout={{ margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-80"
          chartId="home_comparativo_mensual"
        />
      </div>

      {/* Control de Entregas y Plazos SIU */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
          Próximos Compromisos y Fechas Límite de Entrega ({year})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {yearData.siu.controlReportes.map((rep) => (
            <div
              key={rep.id}
              className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{rep.reporte}</span>
                <p className="text-slate-500">Responsable: {rep.responsable}</p>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#e06d26]" />
                  <span>Fecha Límite: <strong className="font-mono">{rep.fechaLimite}</strong></span>
                </div>
              </div>

              <span
                className={`font-semibold px-2.5 py-1 rounded-full text-[11px] ${
                  rep.estado === 'Entregado'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                {rep.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
