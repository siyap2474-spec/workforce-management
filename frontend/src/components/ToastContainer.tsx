import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { removeToast } from "../store/slices/uiSlice";

const ToastItem: React.FC<{ id: string; message: string; type: string }> = ({ id, message, type }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  const typeStyles = {
    success: "bg-emerald-950/80 border-emerald-500/30 text-emerald-400",
    error: "bg-red-950/80 border-red-500/30 text-red-400",
    info: "bg-blue-950/80 border-blue-500/30 text-blue-400",
    warning: "bg-amber-950/80 border-amber-500/30 text-amber-400",
  }[type] || "bg-slate-900/80 border-slate-700/30 text-slate-300";

  const icons = {
    success: (
      <svg className="w-5 h-5 text-emerald-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }[type];

  return (
    <div className={`flex items-center min-w-[280px] max-w-md border backdrop-blur-xl rounded-2xl px-5 py-4 shadow-2xl animate-slide-in transition-all duration-300 relative overflow-hidden ${typeStyles}`}>
      <div className="flex-shrink-0">{icons}</div>
      <div className="text-sm font-medium pr-6 break-words flex-grow">{message}</div>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};

export default ToastContainer;
