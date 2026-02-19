import { getCleanSellerName } from "./seller";

const normalize = (value) => String(value || "").trim().toLowerCase();

const toUnique = (values) =>
    Array.from(new Set(values.map(normalize).filter(Boolean)));

const parseSellerIdentity = (rawSellerName) => {
    const raw = String(rawSellerName || "").trim();
    const names = [];
    const emails = [];

    if (!raw) {
        return { names, emails };
    }

    if (raw.startsWith("{")) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed?.displayName) names.push(parsed.displayName);
            if (parsed?.fullName) names.push(parsed.fullName);
            if (parsed?.email) emails.push(parsed.email);
        } catch {
            names.push(raw);
        }
    } else {
        names.push(raw);
    }

    const cleaned = getCleanSellerName(raw);
    if (cleaned) {
        names.push(cleaned);
    }

    return {
        names: toUnique(names),
        emails: toUnique(emails),
    };
};

export const resolveCurrentUserIdentity = (user = null) => {
    let parsedUser = user;
    if (!parsedUser) {
        try {
            parsedUser = JSON.parse(localStorage.getItem("user"));
        } catch {
            parsedUser = null;
        }
    }

    const names = toUnique([
        parsedUser?.displayName,
        parsedUser?.fullName,
        localStorage.getItem("displayName"),
        localStorage.getItem("fullName"),
    ]);

    const emails = toUnique([
        parsedUser?.email,
        localStorage.getItem("email"),
    ]);

    return {
        names,
        emails,
        primaryName: names[0] || "",
        primaryEmail: emails[0] || "",
    };
};

export const isItemOwnedByUser = (item, user = null) => {
    if (!item) return false;

    const current = resolveCurrentUserIdentity(user);
    if (!current.emails.length && !current.names.length) return false;

    const sellerEmail = normalize(item.sellerEmail);
    if (sellerEmail && current.emails.includes(sellerEmail)) {
        return true;
    }

    const sellerIdentity = parseSellerIdentity(item.sellerName);
    if (
        sellerIdentity.emails.length &&
        sellerIdentity.emails.some((email) => current.emails.includes(email))
    ) {
        return true;
    }

    if (
        sellerIdentity.names.length &&
        sellerIdentity.names.some((name) => current.names.includes(name))
    ) {
        return true;
    }

    return false;
};
