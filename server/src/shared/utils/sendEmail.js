import env from "../../config/env.js";

const sendEmail = async (to, subject, text, html) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: {
                name: "CapacityConnect",
                email: env.BREVO_SENDER_EMAIL,
            },
            to: [{ email: to }],
            subject,
            textContent: text,
            htmlContent: html,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo email send failed: ${response.status} ${errorBody}`);
    }

    return response.json();
};

export default sendEmail;