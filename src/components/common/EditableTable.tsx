import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Plus, Trash2, ArrowUpDown } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T, index: number) => any;
  type?: 'text' | 'number' | 'date' | 'select' | 'readonly';
  options?: string[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  format?: (value: any, row: T) => React.ReactNode;
  onCellChange?: (row: T, newValue: any, rowIndex: number) => void;
  // Si es columna calculada, función de cálculo (no editable)
  calculate?: (row: T) => any;
  // Si debe incluirse en la fila de totales con suma automática
  sumTotal?: boolean;
}

interface EditableTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
  onDataChange?: (newData: T[], changeInfo?: { row: number; key: string; oldValue: any; newValue: any }) => void;
  onAddRow?: () => void;
  onDeleteRow?: (rowIndex: number) => void;
  canAddRow?: boolean;
  canDeleteRow?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  showTotals?: boolean;
  totalsLabel?: string;
  emptyMessage?: string;
  highlightDifference?: boolean; // Alerta si un total no coincide
}

export function EditableTable<T extends { id?: string | number }>({
  title,
  subtitle,
  columns,
  data,
  onDataChange,
  onAddRow,
  onDeleteRow,
  canAddRow = false,
  canDeleteRow = false,
  searchable = true,
  pagination = true,
  pageSize = 15,
  showTotals = true,
  totalsLabel = 'Total General',
  emptyMessage = 'No hay registros disponibles.',
}: EditableTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);

  // Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row, idx) => {
      return columns.some((col) => {
        const val = col.accessor(row, idx);
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, columns]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = col.accessor(a, 0);
      const valB = col.accessor(b, 0);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const startEditing = (rowIdx: number, col: ColumnDef<T>, initialVal: any) => {
    if (col.editable === false || col.type === 'readonly' || col.calculate) return;
    setEditingCell({ rowIdx, colKey: col.key });
    setEditValue(initialVal !== undefined && initialVal !== null ? initialVal : '');
  };

  const commitEdit = (rowIdx: number, col: ColumnDef<T>) => {
    if (!editingCell) return;

    let processedVal: any = editValue;
    if (col.type === 'number') {
      const num = parseFloat(String(editValue).replace(/[$€,\s]/g, ''));
      // Validación: números no negativos
      processedVal = isNaN(num) ? 0 : Math.max(0, num);
    } else if (col.type === 'date') {
      processedVal = String(editValue).trim();
    }

    const row = sortedData[rowIdx];
    const originalIndex = data.indexOf(row);
    const oldVal = col.accessor(row, originalIndex);

    if (col.onCellChange) {
      col.onCellChange(row, processedVal, originalIndex);
    }

    if (onDataChange && originalIndex !== -1) {
      const updatedList = [...data];
      // Si la columna tiene handler directo o asignación
      onDataChange(updatedList, {
        row: originalIndex,
        key: col.key,
        oldValue: oldVal,
        newValue: processedVal,
      });
    }

    setEditingCell(null);
  };

  // Cálculo de totales para columnas marcadas con sumTotal
  const columnTotals = useMemo(() => {
    if (!showTotals) return {};
    const totals: { [key: string]: number } = {};

    for (const col of columns) {
      if (col.sumTotal) {
        totals[col.key] = data.reduce((acc, row, idx) => {
          const val = col.accessor(row, idx);
          return acc + (Number(val) || 0);
        }, 0);
      }
    }
    return totals;
  }, [data, columns, showTotals]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {(title || searchable || canAddRow) && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-white text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en tabla..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 placeholder:text-slate-400 w-44 sm:w-56"
                />
              </div>
            )}

            {canAddRow && onAddRow && (
              <button
                type="button"
                onClick={onAddRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#234a80] hover:bg-[#1b3b66] rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs border border-[#234a80]"
              >
                <Plus className="w-3.5 h-3.5 text-[#e06d26]" />
                <span>Agregar fila</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenedor de tabla con scroll horizontal suave */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {columns.map((col) => {
                const alignClass =
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={`px-3 py-2.5 whitespace-nowrap ${alignClass} select-none group cursor-pointer`}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
              {canDeleteRow && <th scope="col" className="px-3 py-2.5 w-12 text-center">Acción</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (canDeleteRow ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-400 dark:text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const originalIndex = data.indexOf(row);
                return (
                  <tr
                    key={row.id || originalIndex}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col) => {
                      const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colKey === col.key;
                      const cellValue = col.calculate ? col.calculate(row) : col.accessor(row, originalIndex);
                      const alignClass =
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                      const isEditable = col.editable !== false && col.type !== 'readonly' && !col.calculate;

                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-2 whitespace-nowrap ${alignClass} ${
                            col.type === 'number' || col.calculate ? 'tabular-nums font-mono' : ''
                          } ${isEditable ? 'cursor-pointer hover:bg-[#234a80]/10 dark:hover:bg-[#234a80]/20' : ''}`}
                          onClick={() => isEditable && !isEditing && startEditing(rowIdx, col, cellValue)}
                        >
                          {isEditing ? (
                            col.type === 'select' && col.options ? (
                              <select
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(rowIdx, col)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEdit(rowIdx, col);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[#234a80] rounded text-xs focus:outline-none"
                              >
                                {col.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                autoFocus
                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                min={col.type === 'number' ? '0' : undefined}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(rowIdx, col)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEdit(rowIdx, col);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[#234a80] rounded text-xs focus:outline-none tabular-nums font-mono text-slate-900 dark:text-white"
                              />
                            )
                          ) : col.format ? (
                            col.format(cellValue, row)
                          ) : col.type === 'number' && typeof cellValue === 'number' ? (
                            cellValue.toLocaleString()
                          ) : (
                            String(cellValue !== null && cellValue !== undefined ? cellValue : '-')
                          )}
                        </td>
                      );
                    })}

                    {canDeleteRow && (
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setRowToDelete(originalIndex)}
                          title="Eliminar fila"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Fila de Totales Generales Calculados */}
          {showTotals && Object.keys(columnTotals).length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                {columns.map((col, idx) => {
                  const alignClass =
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                  if (idx === 0) {
                    return (
                      <td key={col.key} className={`px-3 py-2.5 whitespace-nowrap ${alignClass}`}>
                        {totalsLabel}
                      </td>
                    );
                  }

                  if (col.sumTotal && columnTotals[col.key] !== undefined) {
                    return (
                      <td key={col.key} className={`px-3 py-2.5 whitespace-nowrap ${alignClass} tabular-nums font-mono text-[#234a80] dark:text-[#9bc2f7]`}>
                        {columnTotals[col.key].toLocaleString()}
                      </td>
                    );
                  }

                  return <td key={col.key} className="px-3 py-2.5" />;
                })}
                {canDeleteRow && <td className="px-3 py-2.5" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Paginación */}
      {pagination && totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} a{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} registros
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Anterior
            </button>
            <span className="px-2 tabular-nums">
              {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar fila */}
      {rowToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-xl">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Confirmar eliminación</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              ¿Está seguro de que desea eliminar esta fila? Los totales y porcentajes se recalcularán de inmediato.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteRow && rowToDelete !== null) {
                    onDeleteRow(rowToDelete);
                  }
                  setRowToDelete(null);
                }}
                className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Eliminar fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
