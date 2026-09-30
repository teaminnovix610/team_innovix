const ALLOWED_ORIGINS = [
    "https://capacityconnect-team-innovix.vercel.app",
    "http://localhost:5173",
];

// Your cookies use sameSite: "none" (required since frontend and backend
// are on different domains), which means the browser will attach them to
// requests from ANY site, not just yours. Without this check, a malicious
// site could embed a hidden form/fetch that POSTs to your API and the
// browser would auto-attach a logged-in user's cookies — a classic CSRF.
//
// This checks the Origin header (sent by browsers on cross-origin
// requests) against your known frontend origins, for any request that
// changes state. GET requests are left alone since they shouldn't change
// state and some legitimate cross-origin GETs (direct link visits, etc.)
// don't always send an Origin header.
//
// Note: this is a pragmatic mitigation, not a full CSRF-token solution —
// it blocks browser-driven cross-site attacks (the realistic threat here)
// but doesn't stop a request forged by a non-browser client that can set
// its own Origin header, since that was never the CSRF threat model.
export default function verifyOrigin(req, res, next) {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
        return next();
    }

    const origin = req.get("origin");

    // No Origin header on a state-changing request from a browser is
    // unusual (browsers reliably send it for CORS requests) — treat
    // missing Origin the same as invalid Origin for safety.
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        return res.status(403).json({
            success: false,
            message: "Request blocked: invalid origin",
        });
    }

    next();
}