import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-slate-600">
      {/* Total & Limit Selector */}
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <strong className="text-slate-800">{startRecord}-{endRecord}</strong> dari <strong className="text-slate-800">{total}</strong> data
        </span>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <span className="text-xs text-slate-500">Per halaman:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-semibold transition-colors ${
              page === num
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Selanjutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
