export const APP_CONFIRM_EVENT = "app-confirm";

export const confirmAction = (message, options = {}) => {
    if (typeof window === "undefined") {
        return Promise.resolve(false);
    }

    return new Promise((resolve) => {
        window.dispatchEvent(
            new CustomEvent(APP_CONFIRM_EVENT, {
                detail: {
                    id: `${Date.now()}-${Math.random()}`,
                    message,
                    title: options.title || "Please confirm",
                    confirmText: options.confirmText || "Confirm",
                    cancelText: options.cancelText || "Cancel",
                    variant: options.variant || "default",
                    resolve,
                },
            }),
        );
    });
};
