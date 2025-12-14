import toast from 'react-hot-toast';

/**
 * Centralized error handling utility
 * Provides consistent error messaging and logging
 */
export class ErrorHandler {
    /**
     * Handle an error with optional context
     * Shows toast notification and logs to console
     */
    static handle(error: unknown, context?: string): void {
        const message = error instanceof Error
            ? error.message
            : String(error);

        const fullMessage = context
            ? `${context}: ${message}`
            : message;

        toast.error(fullMessage, {
            duration: 4000,
            position: 'bottom-right',
            style: {
                background: '#EF4444',
                color: '#FFF',
            }
        });

        // Log for debugging
        if (import.meta.env.DEV) {
            console.error(`[Error] ${fullMessage}`, error);
        }
    }

    /**
     * Show success message
     */
    static success(message: string): void {
        toast.success(message, {
            duration: 2000,
            position: 'bottom-right',
            style: {
                background: '#10B981',
                color: '#FFF',
            }
        });
    }

    /**
     * Show loading toast
     * Returns toast ID for dismissal
     */
    static loading(message: string): string {
        return toast.loading(message, {
            position: 'bottom-right',
        });
    }

    /**
     * Dismiss a specific toast
     */
    static dismiss(toastId: string): void {
        toast.dismiss(toastId);
    }

    /**
     * Show info message
     */
    static info(message: string): void {
        toast(message, {
            duration: 3000,
            position: 'bottom-right',
            icon: 'ℹ️',
        });
    }

    /**
     * Show warning message
     */
    static warning(message: string): void {
        toast(message, {
            duration: 3500,
            position: 'bottom-right',
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#FFF',
            }
        });
    }
}
