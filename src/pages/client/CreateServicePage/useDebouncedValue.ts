import { useEffect, useState } from "react";

// Valor atrasado: só muda quando o original fica igual durante delayMs (pesquisa enquanto se escreve,
// com um só pedido quando o Cliente para de escrever)
export function useDebouncedValue<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer); // se o valor mudar antes do tempo, recomeça a contar
  }, [value, delayMs]);
  return debounced;
}
