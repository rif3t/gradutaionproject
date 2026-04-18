import { useCallback, useEffect, useMemo, useState } from "react";

const initialResult = {
  data: null,
  loading: true,
  error: "",
  warning: "",
};

export function useApiRequest(fetcher, deps = [], options = {}) {
  const { immediate = true, mapData } = options;
  const [result, setResult] = useState(initialResult);

  const execute = useCallback(async () => {
    setResult((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await fetcher();
      const warning = response?.warning || "";
      const mapped = mapData ? mapData(response) : response;

      setResult({
        data: mapped,
        loading: false,
        error: "",
        warning,
      });

      return { data: mapped, warning };
    } catch (error) {
      setResult({
        data: null,
        loading: false,
        error: error?.message || "Failed to load data.",
        warning: "",
      });
      return null;
    }
  }, [fetcher, mapData]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...deps]);

  const helpers = useMemo(
    () => ({
      ...result,
      refetch: execute,
      setData: (updater) => {
        setResult((prev) => ({
          ...prev,
          data: typeof updater === "function" ? updater(prev.data) : updater,
        }));
      },
    }),
    [result, execute],
  );

  return helpers;
}
