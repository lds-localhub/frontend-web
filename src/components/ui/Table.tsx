import type { ReactNode } from "react";
import styles from "./Table.module.css";

// Uma coluna da tabela: o título e o conteúdo de cada linha. A coluna `rowHeader` identifica a linha
// (ex.: o nome), para o leitor de ecrã a anunciar ao percorrer as outras células. A coluna `clamp`
// mostra no máximo duas linhas (ex.: o título de um serviço), para um texto longo não alargar a
// tabela; o texto completo aparece ao passar o rato e no detalhe.
export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  rowHeader?: boolean;
  clamp?: boolean;
  align?: "end";
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
};

// Conteúdo de uma célula; com `clamp`, cortado em duas linhas e, se for texto, com o texto completo
// na dica do browser
function cellContent<T>(column: Column<T>, row: T): ReactNode {
  const content = column.cell(row);
  if (!column.clamp) {
    return content;
  }
  return (
    <span className={styles.clamp} title={typeof content === "string" ? content : undefined}>
      {content}
    </span>
  );
}

// Tabela com as colunas definidas por quem a usa. Cada coluna é identificada pela posição, e não
// pelo título, porque dois títulos podem ser iguais (ex.: «Serviço» e o estado do serviço); as
// colunas são fixas, por isso a posição não muda.
export function Table<T>({ columns, rows, rowKey }: Props<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} data-align={column.align}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column, index) =>
                column.rowHeader ? (
                  <th key={index} scope="row" data-align={column.align}>
                    {cellContent(column, row)}
                  </th>
                ) : (
                  <td key={index} data-align={column.align}>
                    {cellContent(column, row)}
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
