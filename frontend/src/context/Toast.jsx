import { createContext, useContext, useState } from 'react';
const C = createContext();
export const useToast = () => useContext(C);
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const push = (msg, type = 'ok') => { setT({ msg, type }); setTimeout(() => setT(null), 3500); };
  return <C.Provider value={push}>{children}{t && <div className={'toast ' + t.type}>{t.msg}</div>}</C.Provider>;
}
