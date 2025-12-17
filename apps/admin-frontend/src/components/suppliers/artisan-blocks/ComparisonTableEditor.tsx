// apps/admin-frontend/src/components/suppliers/artisan-blocks/ComparisonTableEditor.tsx
// Simple comparison table - max 3 columns, mobile-first

import {
  ComparisonTableBlock,
  BLOCK_LIMITS,
} from "@/types/artisan-block.types";
import { Plus, Trash2, Table } from "lucide-react";

interface ComparisonTableEditorProps {
  block: ComparisonTableBlock;
  onChange: (block: ComparisonTableBlock) => void;
}

export function ComparisonTableEditor({
  block,
  onChange,
}: ComparisonTableEditorProps) {
  const { headers, rows, caption } = block.content;
  const columnCount = headers.length;
  const rowCount = rows.length;

  const canAddColumn = columnCount < BLOCK_LIMITS.TABLE_MAX_COLUMNS;
  const canAddRow = rowCount < BLOCK_LIMITS.TABLE_MAX_ROWS;
  const canRemoveColumn = columnCount > 2;
  const canRemoveRow = rowCount > 1;

  // Update header
  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onChange({
      ...block,
      content: { ...block.content, headers: newHeaders },
    });
  };

  // Update cell
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => (ci === colIndex ? value : cell))
        : row
    );
    onChange({
      ...block,
      content: { ...block.content, rows: newRows },
    });
  };

  // Add column
  const addColumn = () => {
    if (!canAddColumn) return;
    const newHeaders = [...headers, `Cột ${columnCount + 1}`];
    const newRows = rows.map((row) => [...row, ""]);
    onChange({
      ...block,
      content: { ...block.content, headers: newHeaders, rows: newRows },
    });
  };

  // Remove column
  const removeColumn = (index: number) => {
    if (!canRemoveColumn) return;
    const newHeaders = headers.filter((_, i) => i !== index);
    const newRows = rows.map((row) => row.filter((_, i) => i !== index));
    onChange({
      ...block,
      content: { ...block.content, headers: newHeaders, rows: newRows },
    });
  };

  // Add row
  const addRow = () => {
    if (!canAddRow) return;
    const newRow = new Array(columnCount).fill("");
    onChange({
      ...block,
      content: { ...block.content, rows: [...rows, newRow] },
    });
  };

  // Remove row
  const removeRow = (index: number) => {
    if (!canRemoveRow) return;
    const newRows = rows.filter((_, i) => i !== index);
    onChange({
      ...block,
      content: { ...block.content, rows: newRows },
    });
  };

  // Update caption
  const updateCaption = (value: string) => {
    onChange({
      ...block,
      content: { ...block.content, caption: value },
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Table className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Bảng So Sánh
          </span>
        </div>
        <span className="text-[10px] text-gray-400">
          {columnCount}/{BLOCK_LIMITS.TABLE_MAX_COLUMNS} cột • {rowCount}/
          {BLOCK_LIMITS.TABLE_MAX_ROWS} hàng
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Headers */}
          <thead>
            <tr>
              {headers.map((header, colIndex) => (
                <th key={colIndex} className="relative group">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(colIndex, e.target.value)}
                    placeholder={`Tiêu đề ${colIndex + 1}`}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 text-xs font-semibold text-center focus:outline-none focus:bg-white focus:border-orange-400"
                  />
                  {canRemoveColumn && (
                    <button
                      type="button"
                      onClick={() => removeColumn(colIndex)}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </th>
              ))}
              {canAddColumn && (
                <th className="w-10">
                  <button
                    type="button"
                    onClick={addColumn}
                    className="w-full h-full px-2 py-2 bg-gray-50 border border-dashed border-gray-300 text-gray-400 hover:text-orange-500 hover:border-orange-400 transition-colors"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIndex, colIndex, e.target.value)
                      }
                      placeholder="..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 text-xs text-center focus:outline-none focus:border-orange-400"
                    />
                  </td>
                ))}
                {canAddColumn && <td className="w-10" />}
                {canRemoveRow && (
                  <td className="w-8">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      {canAddRow && (
        <button
          type="button"
          onClick={addRow}
          className="w-full py-2 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:text-orange-600 hover:border-orange-400 transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm hàng
        </button>
      )}

      {/* Caption */}
      <input
        type="text"
        value={caption || ""}
        onChange={(e) => updateCaption(e.target.value)}
        placeholder="Chú thích bảng (tùy chọn)..."
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30"
      />

      {/* Mobile hint */}
      <div className="bg-blue-50 border border-blue-200 rounded p-2">
        <p className="text-[10px] text-blue-700">
          📱 Bảng sẽ tự động scroll ngang trên mobile. Giữ tối đa 3 cột để đảm
          bảo trải nghiệm tốt nhất.
        </p>
      </div>
    </div>
  );
}
