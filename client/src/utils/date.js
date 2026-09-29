export function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-IN",
        {

            day: "numeric",

            month: "short",

            year: "numeric",

        }
    );

}

export function formatTime(date) {

    return new Date(date).toLocaleTimeString(
        "en-IN",
        {

            hour: "2-digit",

            minute: "2-digit",

        }
    );

}