import type { StatusFilter } from "@mini-inbox/types";
import { useCallback, useState } from "react";
import { readStatusFilter, withStatusFilter } from "../lib/status-filter";

/**
 * El filtro vive en la URL (?status=...), así sobrevive a una recarga y se puede compartir.
 * Se usa replaceState y no pushState: cambiar de filtro no debería llenar el historial
 * del botón "atrás".
 */
export function useStatusFilter() {
  const [filter, setFilter] = useState(() => readStatusFilter(window.location.search));

  const changeFilter = useCallback((next: StatusFilter) => {
    setFilter(next);
    window.history.replaceState(
      window.history.state,
      "",
      withStatusFilter(window.location.href, next),
    );
  }, []);

  return [filter, changeFilter] as const;
}
