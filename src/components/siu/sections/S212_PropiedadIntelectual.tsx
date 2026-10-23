import React from 'react';
import { PropiedadIntelectualSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Bookmark, BookOpen, Layers } from 'lucide-react';

interface S212Props {
  items: PropiedadIntelectualSIU[];
  onChange: (items: PropiedadIntelectualSIU[]) => void;
  year: number;
}

export const S212_PropiedadIntelectual: React.FC<S212Props> = ({ items, onChange, year }) => {
  const totISSN = items.filter((i) => i.tipoRegistro === 'ISSN').length;
  const totISBN = items.filter((i) => i.tipoRegistro === 'ISBN').length;

  const countBySello: { [sello: string]: number } = {};
  items.forEach((i) => {
    const s = i.sello || 'Otros sellos';
    countBySello[s] = (countBySello[s] || 0) + 1;
  });

  const columns: ColumnDef<PropiedadIntelectualSIU>[] = [
    {
      key: 'tipoRegistro',
      header: 'Tipo',
      accessor: (row) => row.tipoRegistro,
      type: 'select',
      options: ['ISSN', 'ISBN'],
      align: 'center',
      onCellChange: (row, val) => {
        row.tipoRegistro = val;
      },
      format: (val) => (
        <span
          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
            val === 'ISSN'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'codigo',
      header: 'Código Oficial (ISSN / ISBN)',
      accessor: (row) => row.codigo,
      type: 'text',
      onCellChange: (row, val) => {
        row.codigo = String(val);
      },
    },
    {
      key: 'titulo',
      header: 'Título de la Obra o Publicación Seriada',
      accessor: (row) => row.titulo,
      type: 'text',
      onCellChange: (row, val) => {
        row.titulo = String(val);
      },
    },
    {
      key: 'sello',
      header: 'Sello Editorial',
      accessor: (row) => row.sello,
      type: 'text',
      onCellChange: (row, val) => {
        row.sello = String(val);
      },
    },
    {
      key: 'unidad',
      header: 'Unidad Responsable',
      accessor: (row) => row.unidad,
      type: 'text',
      onCellChange: (row, val) => {
        row.unidad = String(val);
      },
    },
    {
      key: 'formato',
      header: 'Formato',
      accessor: (row) => row.formato,
      type: 'select',
      options: ['Impreso', 'Digital', 'Ambos'],
      align: 'center',
      onCellChange: (row, val) => {
        row.formato = val;
      },
    },
    {
      key: 'autores',
      header: 'Autores / Directores',
      accessor: (row) => row.autores,
      type: 'text',
      onCellChange: (row, val) => {
        row.autores = String(val);
      },
    },
  ];

  const handleAdd = () => {
    const newItem: PropiedadIntelectualSIU = {
      id: `pi-${Date.now()}`,
      tipoRegistro: 'ISBN',
      codigo: '978-99961-0-000-0',
      titulo: 'Nueva obra registrada',
      sello: 'UCA Editores',
      unidad: 'CRAI',
      ano: year,
      formato: 'Digital',
      autores: 'Autores institucionales',
    };
    onChange([...items, newItem]);
  };

  const handleDelete = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    onChange(updated);
  };

  const pieChartData: Plotly.Data[] = [
    {
      labels: Object.keys(countBySello),
      values: Object.values(countBySello),
      type: 'pie',
      hole: 0.45,
      textinfo: 'label+value',
      marker: {
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Registros de Propiedad"
          value={items.length}
          subtitle={`Gestionados en ${year}`}
          meta="ISSN e ISBN oficiales"
          icon={Bookmark}
        />
        <KPICard
          title="Registros ISSN (Seriadas)"
          value={totISSN}
          subtitle="Revistas académicas OJS"
          meta="Publicaciones periódicas"
          icon={Layers}
        />
        <KPICard
          title="Registros ISBN (Libros)"
          value={totISBN}
          subtitle="Monografías y capítulos"
          meta="UCA Editores y unidades"
          icon={BookOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <EditableTable
            title="2.12 Registro de Propiedad Intelectual (ISSN e ISBN)"
            subtitle="Inventario de registros editoriales tramitados ante el Centro Nacional de Registros (CNR)."
            columns={columns}
            data={items}
            onDataChange={(newData) => onChange([...newData])}
            canAddRow={true}
            canDeleteRow={true}
            onAddRow={handleAdd}
            onDeleteRow={handleDelete}
            showTotals={false}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Distribución por Sello Editorial
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Participación editorial en el CRAI</p>
          <PlotlyChart
            data={pieChartData}
            layout={{ margin: { l: 20, r: 20, t: 10, b: 20 }, showlegend: true }}
            className="w-full h-64"
            chartId="propiedad_sello_pie"
          />
        </div>
      </div>
    </div>
  );
};
