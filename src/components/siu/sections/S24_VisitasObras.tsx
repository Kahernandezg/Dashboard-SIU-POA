import React from 'react';
import { VisitasObrasSIU, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Users, BookOpen, CreditCard, UserCheck, Plus, Trash2 } from 'lucide-react';

interface S24Props {
  data: VisitasObrasSIU;
  onChange: (data: VisitasObrasSIU) => void;
  year: number;
}

export const S24_VisitasObras: React.FC<S24Props> = ({ data, onChange, year }) => {
  const totHombres = data.visitasHombres.reduce((a, b) => a + (Number(b) || 0), 0);
  const totMujeres = data.visitasMujeres.reduce((a, b) => a + (Number(b) || 0), 0);
  const totVisitas = totHombres + totMujeres;
  const totObras = data.obrasConsultadas.reduce((a, b) => a + (Number(b) || 0), 0);
  const totCarnes = data.carnesEmitidos.reduce((a, b) => a + (Number(b.cantidad) || 0), 0);

  const pctHombres = totVisitas > 0 ? (totHombres / totVisitas) * 100 : 0;
  const pctMujeres = totVisitas > 0 ? (totMujeres / totVisitas) * 100 : 0;

  const handleMonthChange = (serie: 'visitasHombres' | 'visitasMujeres' | 'obrasConsultadas', idx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = {
      ...data,
      [serie]: [...data[serie]],
    };
    updated[serie][idx] = num;
    onChange(updated);
  };

  const handleCarneChange = (idx: number, field: 'tipo' | 'cantidad', val: string) => {
    const updatedCarnes = [...data.carnesEmitidos];
    if (field === 'cantidad') {
      updatedCarnes[idx].cantidad = Math.max(0, parseInt(val, 10) || 0);
    } else {
      updatedCarnes[idx].tipo = val;
    }
    onChange({ ...data, carnesEmitidos: updatedCarnes });
  };

  const handleAddCarne = () => {
    onChange({
      ...data,
      carnesEmitidos: [...data.carnesEmitidos, { id: `c-${Date.now()}`, tipo: 'Nuevo tipo de carné', cantidad: 0 }],
    });
  };

  const handleDeleteCarne = (idx: number) => {
    const updated = [...data.carnesEmitidos];
    updated.splice(idx, 1);
    onChange({ ...data, carnesEmitidos: updated });
  };

  // 1. Gráfico de Barras Apiladas por Género con paleta UCA
  const stackedGenderData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: data.visitasHombres,
      name: 'Usuarios Hombres',
      type: 'bar',
      marker: { color: '#234a80' },
    },
    {
      x: [...MESES_CORTO],
      y: data.visitasMujeres,
      name: 'Usuarios Mujeres',
      type: 'bar',
      marker: { color: '#e06d26' },
    },
  ];

  // 2. Línea de Obras Consultadas vs Visitas Totales
  const lineVisitasObras: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: data.visitasHombres.map((h, i) => h + data.visitasMujeres[i]),
      name: 'Total Usuarios Ingresados',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#234a80', width: 2.5 },
      marker: { size: 6, color: '#234a80' },
    },
    {
      x: [...MESES_CORTO],
      y: data.obrasConsultadas,
      name: 'Obras Consultadas',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#e06d26', width: 2.5 },
      marker: { size: 6, color: '#e06d26' },
    },
  ];

  // 3. Gráfico Donut de Carnés por Tipo
  const donutCarnesData: Plotly.Data[] = [
    {
      labels: data.carnesEmitidos.map((c) => c.tipo),
      values: data.carnesEmitidos.map((c) => c.cantidad),
      type: 'pie',
      hole: 0.45,
      textinfo: 'percent',
      marker: {
        colors: ['#234a80', '#e06d26', '#3b82f6', '#059669', '#d97706', '#64748b', '#0284c7'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Visitas Físicas al CRAI"
          value={totVisitas}
          subtitle={`Año ${year}`}
          meta={`${pctMujeres.toFixed(1)}% mujeres · ${pctHombres.toFixed(1)}% hombres`}
          icon={Users}
        />
        <KPICard
          title="Obras Consultadas"
          value={totObras}
          subtitle="En sala y préstamos externos"
          meta={`Promedio: ${Math.round(totObras / 12)} / mes`}
          icon={BookOpen}
        />
        <KPICard
          title="Carnés Emitidos"
          value={totCarnes}
          subtitle="Comunidad universitaria y externos"
          meta={`${data.carnesEmitidos.length} categorías de carné`}
          icon={CreditCard}
        />
        <KPICard
          title="Ratio Obras / Visitante"
          value={totVisitas > 0 ? (totObras / totVisitas).toFixed(2) : '0.00'}
          subtitle="Intensidad de uso bibliográfico"
          meta="Consultas por usuario"
          icon={UserCheck}
        />
      </div>

      {/* Matriz Mensual de Visitas y Obras */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            2.4 Registro Mensual de Visitas y Obras Consultadas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Los totales generales por mes y año se recalculan automáticamente al modificar los registros.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Concepto</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-2 py-2.5 text-center w-16">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Visitas Hombres */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-indigo-700 dark:text-indigo-400">
                  Usuarios masculinos que ingresaron
                </td>
                {data.visitasHombres.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleMonthChange('visitasHombres', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totHombres.toLocaleString()}
                </td>
              </tr>

              {/* Visitas Mujeres */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-pink-700 dark:text-pink-400">
                  Usuarios femeninos que ingresaron
                </td>
                {data.visitasMujeres.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleMonthChange('visitasMujeres', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-pink-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-pink-700 dark:text-pink-400">
                  {totMujeres.toLocaleString()}
                </td>
              </tr>

              {/* Total Visitas (Calculado - Nunca ingresado a mano) */}
              <tr className="bg-slate-100/60 dark:bg-slate-800/40 font-semibold">
                <td className="px-3 py-2 text-slate-900 dark:text-white">
                  Total usuarios que ingresaron (Calculado)
                </td>
                {data.visitasHombres.map((h, idx) => {
                  const mSum = h + data.visitasMujeres[idx];
                  return (
                    <td key={idx} className="px-1 py-2 text-center font-mono tabular-nums text-slate-900 dark:text-white">
                      {mSum.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totVisitas.toLocaleString()}
                </td>
              </tr>

              {/* Obras Consultadas */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-emerald-700 dark:text-emerald-400">
                  Obras consultadas (sala y préstamo)
                </td>
                {data.obrasConsultadas.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleMonthChange('obrasConsultadas', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/30 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-emerald-500 rounded font-mono tabular-nums text-emerald-800 dark:text-emerald-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                  {totObras.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Carnés Emitidos por Tipo y Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tabla Carnés */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Carnés Emitidos por Tipo</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Desglose de usuarios acreditados</p>
            </div>
            <button
              type="button"
              onClick={handleAddCarne}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg"
              title="Agregar categoría de carné"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800">
            {data.carnesEmitidos.map((carne, idx) => (
              <div key={carne.id || idx} className="py-2 flex items-center justify-between gap-2 text-xs">
                <input
                  type="text"
                  value={carne.tipo}
                  onChange={(e) => handleCarneChange(idx, 'tipo', e.target.value)}
                  className="flex-1 py-1 px-2 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded text-slate-700 dark:text-slate-300"
                />
                <input
                  type="number"
                  min="0"
                  value={carne.cantidad}
                  onChange={(e) => handleCarneChange(idx, 'cantidad', e.target.value)}
                  className="w-16 py-1 px-1 text-right bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums font-semibold text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCarne(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
            <span>Total Carnés Emitidos:</span>
            <span className="font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
              {totCarnes.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Gráfico Donut Carnés */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Distribución de Carnés</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Porcentaje de usuarios registrados por categoría</p>
          <PlotlyChart
            data={donutCarnesData}
            layout={{ margin: { l: 20, r: 20, t: 10, b: 20 }, showlegend: true }}
            className="w-full h-64"
            chartId="carnes_donut"
          />
        </div>

        {/* Gráfico Barras Apiladas Género */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Visitas por Género</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Barras apiladas de afluencia mensual</p>
          <PlotlyChart
            data={stackedGenderData}
            layout={{ barmode: 'stack', margin: { l: 40, r: 20, t: 10, b: 40 } }}
            className="w-full h-64"
            chartId="visitas_genero_stack"
          />
        </div>

        {/* Gráfico Líneas Visitas vs Obras */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Correlación: Visitas Físicas vs Obras Consultadas
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Comportamiento comparativo mensual a lo largo del año {year}
          </p>
          <PlotlyChart
            data={lineVisitasObras}
            layout={{ margin: { l: 45, r: 20, t: 20, b: 40 } }}
            className="w-full h-72"
            chartId="visitas_obras_linea"
          />
        </div>
      </div>
    </div>
  );
};
