import { ArrowRight } from 'lucide-react'

export default function Pagination({ page, totalPages, shown, total, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="pagination">
      <span className="pagination__info">
        Mostrando {shown} de {total} restaurantes
      </span>
      <div className="pagination__pages">
        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'is-active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="page-btn"
          aria-label="Siguiente"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}