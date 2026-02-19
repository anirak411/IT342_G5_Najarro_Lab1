const LEGACY_POSTED_MAP_KEY = "legacy_listing_posted_map_v1";

const readLegacyPostedMap = () => {
    try {
        const raw = localStorage.getItem(LEGACY_POSTED_MAP_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

const writeLegacyPostedMap = (map) => {
    try {
        localStorage.setItem(LEGACY_POSTED_MAP_KEY, JSON.stringify(map));
    } catch {
        // Ignore storage errors and keep UI usable.
    }
};

const getItemPostedDate = (item) => {
    const createdAt = item?.createdAt;
    if (createdAt) {
        const createdDate = new Date(createdAt);
        if (!Number.isNaN(createdDate.getTime())) {
            return createdDate;
        }
    }

    const itemId = item?.id;
    if (!itemId) return null;

    const map = readLegacyPostedMap();
    const existing = map[itemId];
    if (existing) {
        const parsed = new Date(existing);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    const fallbackDate = new Date();
    map[itemId] = fallbackDate.toISOString();
    writeLegacyPostedMap(map);
    return fallbackDate;
};

export function getListingAgeLabel(item) {
    const createdDate = getItemPostedDate(item);
    if (!createdDate) return "Posted date unavailable";

    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const years = Math.floor(days / 365);

    if (minutes < 1) return "Posted just now";
    if (minutes === 1) return "Posted 1 minute ago";
    if (minutes < 60) return `Posted ${minutes} minutes ago`;
    if (hours === 1) return "Posted 1 hour ago";
    if (hours < 24) return `Posted ${hours} hours ago`;
    if (days === 1) return "Posted 1 day ago";
    if (days < 7) return `Posted ${days} days ago`;
    if (weeks === 1) return "Posted 1 week ago";
    if (days < 365) return `Posted ${weeks} weeks ago`;
    if (years === 1) return "Posted 1 year ago";
    return `Posted ${years} years ago`;
}
