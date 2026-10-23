import React from 'react';
import { RepositorioRIUCASIU, DocumentoRIUCASIU, MESES_CORTO } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Archive, TrendingUp, Layers, BookOpen } from 'lucide-react';

interface S26Props {
  data: RepositorioRIUCASIU;
  onChange: (data: RepositorioRIUCASIU) => void;
  year: number;
}

export const S26_RepositorioRIUCA: React.FC<S26Props> = ({ data, onChange, year }) => {
  const totalCrecimiento = data.crecimientoMensual.reduce((a, b) => a + (Number(b) || 0), 0);
  const totalDocs = data.documentos.length;

  // Conteo por Área MINED (1-10)
  const areaCounts: { [area: number]: number } = {};
  for (let i = 1; i <= 10; i++) areaCounts[i] = 0;
  data.documentos.forEach((d) => {
    const a = Number(d.areaMined) || 1;
    areaCounts[a] = (areaCounts[a] || 0) + 1;
  });

  // Conteo por Comunidad
  const comunidadCounts: { [com: string]: number } = {};
  data.documentos.forEach((d) => {
    const c = d.comunidad || 'Sin clasificar';
    comunidadCounts[c] = (comunidadCounts[c] || 0) + 1;
  });

  // Trayectoria acumulada mensual
  const acumuladoMes: number[] = [];
  let s = 0;
  for (const m of data.crecimientoMensual) {
    s += Number(m) || 0;
    acumuladoMes.push(s);
  }

  // Columnas para la tabla editable de documentos
  const docColumns: ColumnDef<DocumentoRIUCASIU>[] = [
    {
      key: 'no',
      header: 'No.',
      accessor: (row, idx) => row.no || idx + 1,
      type: 'readonly',
      width: '60px',
      align: 'center',
    },
    {
      key: 'titulo',
      header: 'Título del Documento',
      accessor: (row) => row.titulo,
      type: 'text',
      onCellChange: (row, val) => {
        row.titulo = String(val);
      },
    },
    {
      key: 'handle',
      header: 'Enlace Handle (RIUCA)',
      accessor: (row) => row.handle,
      type: 'text',
      format: (val) => (
        <a
          href={String(val)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#234a80] dark:text-[#9bc2f7] hover:underline font-mono text-[11px]"
        >
          {String(val)}
        </a>
      ),
      onCellChange: (row, val) => {
        row.handle = String(val);
      },
    },
    {
      key: 'comunidad',
      header: 'Comunidad Institucional',
      accessor: (row) => row.comunidad,
      type: 'text',
      onCellChange: (row, val) => {
        row.comunidad = String(val);
      },
    },
    {
      key: 'coleccion',
      header: 'Colección',
      accessor: (row) => row.coleccion,
      type: 'text',
      onCellChange: (row, val) => {
        row.coleccion = String(val);
      },
    },
    {
      key: 'financiamiento',
      header: 'Financiamiento',
      accessor: (row) => row.financiamiento,
      type: 'text',
      onCellChange: (row, val) => {
        row.financiamiento = String(val);
      },
    },
    {
      key: 'fecha',
      header: 'Fecha de Publicación',
      accessor: (row) => row.fecha,
      type: 'date',
      onCellChange: (row, val) => {
        row.fecha = String(val);
      },
    },
    {
      key: 'areaMined',
      header: 'Área MINED',
      accessor: (row) => `Área ${row.areaMined || 1}`,
      type: 'number',
      align: 'center',
      onCellChange: (row, val) => {
        row.areaMined = Number(val) || 1;
      },
    },
  ];

  const handleAddDoc = () => {
    const newDoc: DocumentoRIUCASIU = {
      id: `doc-${Date.now()}`,
      no: data.documentos.length + 1,
      titulo: 'Nuevo documento en RIUCA',
      handle: `http://hdl.handle.net/11715/${Date.now().toString().slice(-4)}`,
      comunidad: 'Ciencias Sociales y Humanidades',
      coleccion: 'Artículos de investigación',
      financiamiento: 'VRII UCA',
      fecha: new Date().toISOString().split('T')[0],
      areaMined: 5,
    };
    onChange({
      ...data,
      documentos: [...data.documentos, newDoc],
    });
  };

  const handleDeleteDoc = (index: number) => {
    const updated = [...data.documentos];
    updated.splice(index, 1);
    onChange({
      ...data,
      documentos: updated,
    });
  };

  const handleCrecimientoChange = (monthIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updatedMonths = [...data.crecimientoMensual];
    updatedMonths[monthIdx] = num;
    onChange({
      ...data,
      crecimientoMensual: updatedMonths,
    });
  };

  // 1. Gráfico de Ingreso por Área MINED (Plotly Bar con UCA Blue)
  const chartMinedData: Plotly.Data[] = [
    {
      x: Object.keys(areaCounts).map((k) => `Área ${k}`),
      y: Object.values(areaCounts),
      type: 'bar',
      marker: { color: '#234a80' },
      text: Object.values(areaCounts).map(String),
      textposition: 'auto',
    },
  ];

  // 2. Gráfico de Crecimiento Mensual Acumulado (Plotly Line con UCA Orange)
  const chartCrecimientoData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: data.crecimientoMensual,
      name: 'Nuevos Ítems por Mes',
      type: 'bar',
      marker: { color: '#64748b' },
    },
    {
      x: [...MESES_CORTO],
      y: acumuladoMes,
      name: 'Total Acumulado en el Año',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#e06d26', width: 3 },
      marker: { size: 6, color: '#e06d26' },
    },
  ];

  // 3. Sunburst Jerarquía Comunidad -> Colección
  const sunburstLabels: string[] = ['RIUCA'];
  const sunburstParents: string[] = [''];
  const sunburstValues: number[] = [totalDocs];

  const comunidades = Array.from(new Set(data.documentos.map((d) => d.comunidad || 'General')));
  comunidades.forEach((c) => {
    sunburstLabels.push(c);
    sunburstParents.push('RIUCA');
    const count = data.documentos.filter((d) => (d.comunidad || 'General') === c).length;
    sunburstValues.push(count);

    // Colecciones dentro de la comunidad
    const colecciones = Array.from(
      new Set(data.documentos.filter((d) => (d.comunidad || 'General') === c).map((d) => d.coleccion || 'General'))
    );
    colecciones.forEach((col) => {
      const colLabel = `${c} - ${col}`;
      sunburstLabels.push(col);
      sunburstParents.push(c);
      const colCount = data.documentos.filter(
        (d) => (d.comunidad || 'General') === c && (d.coleccion || 'General') === col
      ).length;
      sunburstValues.push(colCount);
    });
  });

  const sunburstData: Plotly.Data[] = [
    {
      type: 'sunburst',
      labels: sunburstLabels,
      parents: sunburstParents,
      values: sunburstValues,
      branchvalues: 'total',
      marker: {
        colorscale: 'Blues',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Documentos Catalogados"
          value={totalDocs}
          subtitle={`En el repositorio (${year})`}
          meta="Acceso Abierto Institucional"
          icon={Archive}
        />
        <KPICard
          title="Crecimiento Total Anual"
          value={totalCrecimiento}
          subtitle="Ítems ingresados en el año"
          meta={`Promedio: ${Math.round(totalCrecimiento / 12)} / mes`}
          icon={TrendingUp}
        />
        <KPICard
          title="Comunidades Activas"
          value={Object.keys(comunidadCounts).length}
          subtitle="Facultades y centros UCA"
          meta="Cobertura multidisciplinaria"
          icon={Layers}
        />
        <KPICard
          title="Áreas MINED Cubiertas"
          value={Object.values(areaCounts).filter((c) => c > 0).length}
          subtitle="De 10 áreas oficiales MINED"
          meta="Clasificación nacional"
          icon={BookOpen}
        />
      </div>

      {/* Matriz de Crecimiento Mensual */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Crecimiento Mensual de Documentos en RIUCA ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro mensual de depósitos realizados en el repositorio institucional
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5">Concepto</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-2 py-2.5 text-center w-16">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                  Documentos ingresados
                </td>
                {data.crecimientoMensual.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleCrecimientoChange(idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-800 dark:text-slate-200"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totalCrecimiento.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos: MINED, Crecimiento Acumulado y Sunburst */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Producción por Área del MINED (1-10)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribución según taxonomía oficial del Ministerio de Educación
          </p>
          <PlotlyChart
            data={chartMinedData}
            layout={{ margin: { l: 40, r: 20, t: 20, b: 50 }, xaxis: { tickangle: -30 } }}
            className="w-full h-72"
            chartId="riuca_mined_barras"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Crecimiento Mensual y Acumulado
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Evolución de las incorporaciones bibliográficas en RIUCA
          </p>
          <PlotlyChart
            data={chartCrecimientoData}
            layout={{ margin: { l: 45, r: 20, t: 20, b: 40 } }}
            className="w-full h-72"
            chartId="riuca_crecimiento_linea"
          />
        </div>

        {/* Sunburst Comunidad -> Colección */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Estructura Jerárquica Sunburst: Comunidad → Colección
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Exploración interactiva multinivel del repositorio institucional RIUCA
          </p>
          <PlotlyChart
            data={sunburstData}
            layout={{ margin: { l: 20, r: 20, t: 20, b: 20 } }}
            className="w-full h-80"
            chartId="riuca_sunburst"
          />
        </div>
      </div>

      {/* Tabla Editable de Documentos Indexados con Detección de Duplicados */}
      <EditableTable
        title="Listado de Documentos en RIUCA (Detección por Handle)"
        subtitle="Haga clic en las celdas para modificar títulos, enlaces o áreas temáticas. Los duplicados se detectan automáticamente por su enlace permanente Handle."
        columns={docColumns}
        data={data.documentos}
        onDataChange={(newData) => onChange({ ...data, documentos: [...newData] })}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAddDoc}
        onDeleteRow={handleDeleteDoc}
        showTotals={false}
      />
    </div>
  );
};
