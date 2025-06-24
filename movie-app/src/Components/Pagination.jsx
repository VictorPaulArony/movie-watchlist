import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Show up to 5 page numbers, with ellipsis if needed
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 mt-8 select-none">
      <button
        className="px-3 py-1 rounded bg-gray-700 text-white font-semibold disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        &larr;
      </button>
      {getPageNumbers().map((page, idx) =>
        page === '...'
          ? <span key={idx} className="px-2 text-gray-400">...</span>
          : <button
              key={page}
              className={`px-3 py-1 rounded font-semibold transition-all duration-150 ${
                page === currentPage
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-800 hover:bg-amber-200'
              }`}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
      )}
      <button
        className="px-3 py-1 rounded bg-gray-700 text-white font-semibold disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        &rarr;
      </button>
    </nav>
  );
};

export default Pagination; 