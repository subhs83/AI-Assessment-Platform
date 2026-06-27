import { createContext, useContext, useState, useRef } from "react";
import {CheckCircle2, XCircle, Info, X} from "lucide-react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
  }

export function ToastProvider({ children }) {

const [toast, setToast] = useState(null);

const timerRef = useRef(null);

const showToast = (
message,
type = "success",
duration = 3000
) => {

if (timerRef.current) {
  clearTimeout(timerRef.current);
}

const id = Date.now();

setToast({  id,  message,  type,});

timerRef.current = setTimeout(() => {
  setToast(null);
}, duration);

};

const removeToast = () => {

if (timerRef.current) {
  clearTimeout(timerRef.current);
}

setToast(null);

};

const icons = {
success: <CheckCircle2 size={20} />,
error: <XCircle size={20} />,
info: <Info size={20} />,
};

const styles = {
 success:
"bg-slate-900/95 text-white border border-slate-700 rounded-2xl backdrop-blur-xl shadow-2xl",

  error:
"bg-slate-900/95 text-white border border-red-500/20 rounded-2xl backdrop-blur-xl shadow-2xl",

  info:
"bg-slate-900/95 text-white border border-blue-500/20 rounded-2xl backdrop-blur-xl shadow-2xl",
};

const iconColors = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-blue-400",
};

return (

<ToastContext.Provider value={{ showToast }}>

  {children}

  {toast && (

    <div
      key={toast.id}
      className="
        fixed
        top-6
        right-6
        z-[9999]
        animate-in
        slide-in-from-right-5
        fade-in
        duration-300
      "
    >

      <div
        className={`
          flex
          items-center
          gap-3
          w-[380px]
          max-w-[calc(100vw-32px)]
          px-5
          py-4
          rounded-2xl
          backdrop-blur-xl
          shadow-[0_20px_50px_rgba(0,0,0,0.12)]
          ${styles[toast.type]}
        `}
      >

        <span
          className={iconColors[toast.type]}
        >
          {icons[toast.type]}
        </span>

        <span className="flex-1 font-medium">

          {toast.message}

        </span>

        <button
          onClick={removeToast}
          className="
            text-gray-400
            hover:text-gray-700
            transition
          "
        >

          <X size={16} />

        </button>

      </div>

    </div>

  )}

</ToastContext.Provider>

);
}
