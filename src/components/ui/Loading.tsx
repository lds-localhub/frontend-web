// Indicação de carregamento, enquanto ainda não há dados em cache.
export function Loading() {
  return (
    <p role="status" aria-live="polite">
      A carregar…
    </p>
  );
}
