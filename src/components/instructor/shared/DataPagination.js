import Pagination from "react-bootstrap/Pagination";

function DataPagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  const current = meta.page;
  const totalPages = meta.totalPages;

  const pages = [];
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - current) <= 1) {
      pages.push(page);
    }
  }

  const uniquePages = [...new Set(pages)].sort((a, b) => a - b);

  return (
    <Pagination className="mb-0 mt-3 justify-content-end">
      <Pagination.Prev
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      />
      {uniquePages.map((page, idx) => {
        const previous = uniquePages[idx - 1];
        const hasGap = previous && page - previous > 1;

        return (
          <span key={`slot-${page}`}>
            {hasGap && <Pagination.Item disabled>...</Pagination.Item>}
            <Pagination.Item
              active={page === current}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Pagination.Item>
          </span>
        );
      })}
      <Pagination.Next
        disabled={current >= totalPages}
        onClick={() => onPageChange(current + 1)}
      />
    </Pagination>
  );
}

export default DataPagination;
