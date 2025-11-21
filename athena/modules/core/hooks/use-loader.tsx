import { useContext } from "react";
import { LoaderContext } from "@/modules/core/providers/loader-provider";

export const useLoader = () => {
  const { loading, setLoading } = useContext(LoaderContext);

  if (loading === undefined || setLoading === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return { loading, setLoading };
};
