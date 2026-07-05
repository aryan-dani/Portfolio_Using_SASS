import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  // useRef keeps the counter scoped to the provider instance (not a module global),
  // which is safer for testing and avoids counter drift on re-mounts.
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", options = {}) => {
      const id = ++counterRef.current;
      const toast = {
        id,
        message,
        type,
        title: options.title || getDefaultTitle(type),
        duration: options.duration || 4000,
      };

      setToasts((prev) => [...prev, toast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, toast.duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // Alias for backward compatibility
  const showToast = addToast;

  return (
    <ToastContext.Provider value={{ toasts, addToast, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function getDefaultTitle(type) {
  const titles = {
    info: "Info",
    success: "Success",
    warning: "Warning",
    error: "Error",
  };
  return titles[type] || "Notification";
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    info: "💡",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <motion.div
      className={`toast toast--${toast.type}`}
      role="alert"
      initial={{ opacity: 0, y: -32, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="toast__icon">{icons[toast.type]}</span>
      <div className="toast__content">
        <strong className="toast__title">{toast.title}</strong>
        <p className="toast__message">{toast.message}</p>
      </div>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
