export function getCleanSellerName(rawSellerName) {
    const raw = (rawSellerName || "").trim();
    if (!raw) return "Unknown Seller";

    if (raw.startsWith("{")) {
        try {
            const parsed = JSON.parse(raw);
            return parsed.displayName || parsed.fullName || raw;
        } catch {
            return raw;
        }
    }

    return raw;
}
