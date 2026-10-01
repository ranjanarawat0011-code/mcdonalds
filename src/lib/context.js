import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./store";

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function usePageTitle(title) {
  useEffect(() => { document.title = title + " | McDonald's India"; }, [title]);
}

export function useLogout() {
  const { setUser, toast } = useApp();
  const navigate = useNavigate();
  return () => {
    setUser(null);
    toast("Logged out successfully", "success");
    navigate("/");
  };
}

// Loads `path` from the API. Pass null to skip. Returns { data, error, loading, reload }.
export function useApi(path) {
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const [version, setVersion] = useState(0);
  const key = path && path + "#" + version;

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    api(path).then(
      data => !cancelled && setResult({ key, data, error: null }),
      err => !cancelled && setResult({ key, data: null, error: err.message })
    );
    return () => { cancelled = true; };
  }, [key, path]);

  const loading = !!key && result.key !== key;
  return { data: loading ? null : result.data, error: loading ? null : result.error, loading, reload: () => setVersion(v => v + 1) };
}
