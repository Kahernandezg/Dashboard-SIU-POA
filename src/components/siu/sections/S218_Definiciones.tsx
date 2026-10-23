import React from 'react';
import { DefinicionCatalogoSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { BookA, Tag, Info } from 'lucide-react';

interface S218Props {
  items: DefinicionCatalogoSIU[];
  onChange: (items: DefinicionCatalogoSIU[]) => void;
  year: number;
}

export const S218_Definiciones: React.FC<S218Props> = ({ items, onChange, year }) => {
  const categoriasUnicas = Array.from(new Set(items.map((i) => i.categoria)));

  const columns: ColumnDef<DefinicionCatalogoSIU>[] = [
    {
      key: 'categoria',
      header: 'Categoría Institucional',
      accessor: (row) => row.categoria,
      type: 'text',
      onCellChange: (row, val) => {
        row.categoria = String(val);
      },
    },
    {
      key: 'codigo',
      header: 'Código / Clave',
      accessor: (row) => row.codigo,
      type: 'text',
      align: 'center',
      onCellChange: (row, val) => {
        row.codigo = String(val);
      },
      format: (val) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{val}</span>,
    },
    {
      key: 'nombre',
      header: 'Término / Nombre',
      accessor: (row) => row.nombre,
      type: 'text',
      onCellChange: (row, val) => {
        row.nombre = String(val);
      },
    },
    {
      key: 'descripcion',
      header: 'Descripción / Definición Operativa',
      accessor: (row) => row.descripcion,
      type: 'text',
      onCellChange: (row, val) => {
        row.descripcion = String(val);
      },
    },
  ];

  const handleAdd = () => {
    const newItem: DefinicionCatalogoSIU = {
      id: `def-${Date.now()}`,
      categoria: 'General',
      codigo: `DEF_${items.length + 1}`,
      nombre: 'Nuevo concepto o indicador',
      descripcion: 'Definición para uso en reportes y listas desplegables',
    };
    onChange([...items, newItem]);
  };

  const handleDelete = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Explicación institucional */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Catálogo Oficial de Definiciones CRAI / SIU
          </h4>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5">
            Estas definiciones alimentan las taxonomías de las 17 secciones (áreas del MINED 1-10, tipos de recursos, formatos y acreditaciones). Toda modificación se refleja en los reportes consolidados del año {year}.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard
          title="Términos en Catálogo"
          value={items.length}
          subtitle="Conceptos y taxonomías"
          meta="Glosario estandarizado"
          icon={BookA}
        />
        <KPICard
          title="Categorías Activas"
          value={categoriasUnicas.length}
          subtitle="Áreas MINED, TIC, Publicaciones"
          meta="Taxonomía universitaria"
          icon={Tag}
        />
      </div>

      <EditableTable
        title="2.18 Catálogo Editable de Definiciones y Glosario"
        subtitle="Haga clic en las celdas para modificar nombres o descripciones. Puede agregar nuevos conceptos institucionales."
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
  );
};
