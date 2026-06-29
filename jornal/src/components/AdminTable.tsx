'use client';

import { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export default function AdminTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 20,
}: AdminTableProps<T>) {
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.ceil(data.length / pageSize);
  const inicio = (pagina - 1) * pageSize;
  const paginated = data.slice(inicio, inicio + pageSize);

  function getCellValue(row: T, key: string): React.ReactNode {
    return (row as Record<string, unknown>)[key] as React.ReactNode;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 font-semibold text-ink whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-muted">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className="hover:bg-surface transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      {col.render ? col.render(row) : String(getCellValue(row, String(col.key)) ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            Exibindo {inicio + 1}–{Math.min(inicio + pageSize, data.length)} de {data.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="btn-ghost py-1 px-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - pagina) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`py-1 px-3 text-sm rounded border transition-colors ${
                    p === pagina
                      ? 'bg-primary text-white border-primary'
                      : 'border-border hover:bg-surface'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="btn-ghost py-1 px-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
