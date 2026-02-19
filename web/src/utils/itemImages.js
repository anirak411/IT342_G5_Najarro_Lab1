export function getItemImages(item) {
    const raw = item?.imageUrl;
    if (!raw) return [];

    if (Array.isArray(raw)) {
        return raw.filter(Boolean);
    }

    if (typeof raw !== "string") {
        return [];
    }

    const trimmed = raw.trim();
    if (!trimmed) return [];

    // Backward compatible: support JSON array, comma-separated URLs, or single URL.
    if (trimmed.startsWith("[")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }
        } catch {
            // Fall back to comma-separated parsing below.
        }
    }

    if (trimmed.includes(",")) {
        return trimmed
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    }

    return [trimmed];
}

export function getPrimaryImage(item) {
    const images = getItemImages(item);
    return images[0] || "";
}
