"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { X } from "lucide-react"

type ToastType = "success" | "error" | "info"

export type Toast = {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])

        // Auto dismiss
        setTimeout(() => {
            removeToast(id)
        }, 4000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between gap-3 p-3 px-4 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${toast.type === "success"
                                ? "bg-surface border-green-500/50 text-green-400"
                                : toast.type === "error"
                                    ? "bg-surface border-red-500/50 text-red-400"
                                    : "bg-surface border-amber-500/50 text-amber-400"
                            }`}
                    >
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-muted hover:text-white transition-colors p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
