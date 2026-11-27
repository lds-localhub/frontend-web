import type { Page } from "@/api/types";
import { Button } from "./Button";
import styles from "./Pagination.module.css";

type Props<T> = {
  page: Page<T>;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

// Paginação de uma lista paginada (Page<T>): «Anterior», «Página X de Y» e «Seguinte».
// Não sabe onde a página é guardada (URL ou estado): só avisa quem a usa.
export function Pagination<T>({ page, onPageChange, disabled = false }: Props<T>) {
  const totalPages = Math.ceil(page.total / page.pageSize);
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination}>
      <Button
        variant="secondary"
        disabled={disabled || page.page <= 1}
        onClick={() => onPageChange(page.page - 1)}
      >
        ‹ Anterior
      </Button>
      <span>
        Página {page.page} de {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={disabled || page.page >= totalPages}
        onClick={() => onPageChange(page.page + 1)}
      >
        Seguinte ›
      </Button>
    </nav>
  );
}
