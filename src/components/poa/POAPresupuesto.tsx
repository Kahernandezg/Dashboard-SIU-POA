import React from 'react';
import { RubroPresupuesto } from '../../types';
import { EditableTable, ColumnDef } from '../common/EditableTable';
import { KPICard } from '../common/KPICard';
import { DollarSign, Layers } from 'lucide-react';
import { PlotlyChart } from '../common/PlotlyChart';

interface POAPresupuestoProps {
  items: RubroPresupuesto[];
  onChange: (items: RubroPresupuesto[]) => void;
  year: number;
}

export const POAPresupuesto: React.FC<POAPresupuestoProps> = ({ items, onChange, year }) => {
  const totalMonto = items.reduce((sum, item) => sum + (Number(item.monto) || 0), 0);

  const columns: ColumnDef<RubroPresupuesto>[] = [
    {
      key: 'rubro',
      header: 'Rubro / Concepto de Presupuesto',
      accessor: (row) => row.rubro,
      type: 'text',
      onCellChange: (row, val) => {
        row.rubro = String(val);
      },
    },
    {
      key: 'monto',
      header: 'Monto Estimado ($ USD)',
      accessor: (row) => row.monto,
      type: 'number',
      align: 'right',
      sumTotal: true,
      format: (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      onCellChange: (row, val) => {
        row.monto = Number(val) || 0;
      },
    },
    {
      key: 'porcentaje',
      header: '% del Total',
      accessor: (row) => (totalMonto > 0 ? ((Number(row.monto) / totalMonto) * 100).toFixed(1) + '%' : '0%'),
      type: 'readonly',
      align: 'right',
      calculate: (row) => (totalMonto > 0 ? ((Number(row.monto) / totalMonto) * 100).toFixed(1) + '%' : '0%'),
    },
    {
      key: 'comentarios',
      header: 'Comentarios / Justificación Institucional',
      accessor: (row) => row.comentarios || '',
      type: 'text',
      onCellChange: (row, val) => {
        row.comentarios = String(val);
      },
    },
  ];

  const handleAddRow = () => {
    const newItem: RubroPresupuesto = {
      id: `pres-${Date.now()}`,
      rubro: `Nuevo rubro ${items.length + 1}`,
      monto: 0,
      comentarios: '',
    };
    onChange([...items, newItem]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  // Datos para gráfico Plotly de distribución del presupuesto con paleta UCA
  const chartData: Plotly.Data[] = [
    {
      labels: items.map((i) => i.rubro),
      values: items.map((i) => i.monto),
      type: 'pie',
      hole: 0.45,
      textinfo: 'label+percent',
      marker: {
        colors: ['#234a80', '#e06d26', '#3b82f6', '#059669', '#d97706', '#64748b'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Total Presupuesto Línea Micelio"
          value={`$${totalMonto.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={`Ejercicio ${year}`}
          meta="Fondos asignados"
          icon={DollarSign}
        />
        <KPICard
          title="Cantidad de Rubros"
          value={items.length}
          subtitle="Partidas presupuestarias"
          meta="100% presupuestado"
          icon={Layers}
        />
        <KPICard
          title="Promedio por Partida"
          value={`$${items.length > 0 ? (totalMonto / items.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`}
          subtitle="Distribución media"
          meta="USD"
        />
      </div>

      {/* Gráfico y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <EditableTable
            title="1.1 Presupuesto de la Línea Micelio"
            subtitle="Haga clic en cualquier celda para editar el monto o concepto. Los totales y porcentajes se recalculan automáticamente."
            columns={columns}
            data={items}
            onDataChange={(newData) => onChange([...newData])}
            canAddRow={true}
            canDeleteRow={true}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            totalsLabel="Total Presupuesto Asignado"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Distribución del Presupuesto</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Participación porcentual por rubro</p>
          <PlotlyChart
            data={chartData}
            layout={{
              margin: { l: 20, r: 20, t: 10, b: 20 },
              showlegend: true,
            }}
            className="w-full h-64"
            chartId="poa_presupuesto_donut"
          />
        </div>
      </div>
    </div>
  );
};
