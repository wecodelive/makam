export const APP_NOTIFY_EVENT = "app-notify";

const emitNotification = (message, type = "error") => {
    if (!message || typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent(APP_NOTIFY_EVENT, {
            detail: {
                id: `${Date.now()}-${Math.random()}`,
                message,
                type,
            },
        }),
    );
};

export const notifyError = (message) => emitNotification(message, "error");
export const notifySuccess = (message) => emitNotification(message, "success");
