import type { ReactNode } from "react";
import styles from "./Table.module.css";

// Uma coluna da tabela: o título e o conteúdo de cada linha. A coluna `rowHeader` identifica a linha
// (ex.: o nome), para o leitor de ecrã a anunciar ao percorrer as outras células.
export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  rowHeader?: boolean;
  align?: "end";
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
};

// Tabela com as colunas definidas por quem a usa
export function Table<T>({ columns, rows, rowKey }: Props<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} data-align={column.align}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) =>
                column.rowHeader ? (
                  <th key={column.header} scope="row" data-align={column.align}>
                    {column.cell(row)}
                  </th>
                ) : (
                  <td key={column.header} data-align={column.align}>
                    {column.cell(row)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
