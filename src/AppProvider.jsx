import { useCallback, useRef, useState } from "react";
import { AppContext, useApi } from "./lib/context";
import { getCart, getCurrentUser, saveCartStorage, storeCurrentUser } from "./lib/store";

export default function AppProvider({ children }) {
  const [user, setUserState] = useState(getCurrentUser);
  const [cart, setCartState] = useState(getCart);
  const [toastMsg, setToastMsg] = useState(null);
  const timer = useRef();
  const menu = useApi("menu"); // loaded once and shared by Home, Menu and Item pages

  const setUser = useCallback((u, remember) => { storeCurrentUser(u, remember); setUserState(u); }, []);
  const setCart = useCallback(c => { saveCartStorage(c); setCartState(c); }, []);
  const toast = useCallback((msg, type = "") => {
    clearTimeout(timer.current);
    setToastMsg({ msg, type, key: Date.now() });
    timer.current = setTimeout(() => setToastMsg(null), 2500);
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, cart, setCart, toast, menu }}>
      {children}
      {toastMsg && <div key={toastMsg.key} className={"toast " + toastMsg.type}>{toastMsg.msg}</div>}
    </AppContext.Provider>
  );
}
