import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";
import { getPrimaryImage } from "../utils/itemImages";
import { getListingAgeLabel } from "../utils/itemTime";
import BackButton from "../components/BackButton";
import { isItemOwnedByUser } from "../utils/ownership";

function Profile() {
    const navigate = useNavigate();
    const cropPresets = {
        profile: {
            previewWidth: 260,
            previewHeight: 260,
            outputWidth: 700,
            outputHeight: 700,
            shape: "circle",
        },
        cover: {
            previewWidth: 560,
            previewHeight: 220,
            outputWidth: 1600,
            outputHeight: 630,
            shape: "rect",
        },
    };
    const formatPrice = (value) =>
        Number(value || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const [user, setUser] = useState(null);
    const [profilePic, setProfilePic] = useState("");
    const [coverPic, setCoverPic] = useState("");
    const [listings, setListings] = useState([]);
    const [cropModal, setCropModal] = useState({
        open: false,
        type: "profile",
        src: "",
        imgWidth: 0,
        imgHeight: 0,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
    });
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef({
        pointerX: 0,
        pointerY: 0,
        offsetX: 0,
        offsetY: 0,
    });

    useEffect(() => {
        let storedUser = null;

        try {
            storedUser = JSON.parse(localStorage.getItem("user"));
        } catch {
            storedUser = null;
        }

        if (!storedUser) {
            const displayName =
                localStorage.getItem("displayName") ||
                localStorage.getItem("fullName") ||
                "";
            const fullName =
                localStorage.getItem("fullName") ||
                localStorage.getItem("displayName") ||
                "";
            const email = localStorage.getItem("email") || "";

            if (displayName || email) {
                storedUser = { displayName, fullName, email };
            }
        }

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(storedUser);

        const profileKey = `profilePic_${storedUser.displayName}`;
        const coverKey = `coverPic_${storedUser.displayName}`;

        setProfilePic(localStorage.getItem(profileKey) || "");
        setCoverPic(localStorage.getItem(coverKey) || "");
    }, [navigate]);

    useEffect(() => {
        if (!user) return;

        const fetchUserMedia = async () => {
            const email = user.email || localStorage.getItem("email") || "";
            if (!email) return;

            try {
                const res = await axios.get("http://localhost:8080/api/users/me", {
                    params: { email },
                });

                const backendProfile = res.data?.profilePicUrl || "";
                const backendCover = res.data?.coverPicUrl || "";

                const profileKey = `profilePic_${user.displayName}`;
                const coverKey = `coverPic_${user.displayName}`;

                if (!localStorage.getItem(profileKey) && backendProfile) {
                    localStorage.setItem(profileKey, backendProfile);
                    setProfilePic(backendProfile);
                }

                if (!localStorage.getItem(coverKey) && backendCover) {
                    localStorage.setItem(coverKey, backendCover);
                    setCoverPic(backendCover);
                }
            } catch {
                // keep local fallback
            }
        };

        fetchUserMedia();

        const fetchListings = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/items");
                const currentUserEmail = (
                    user.email ||
                    localStorage.getItem("email") ||
                    ""
                )
                    .trim()
                    .toLowerCase();
                const currentDisplayName = (
                    user.displayName ||
                    localStorage.getItem("displayName") ||
                    user.fullName ||
                    localStorage.getItem("fullName") ||
                    ""
                )
                    .trim()
                    .toLowerCase();

                const myItems = res.data.filter((item) => {
                    if (!currentUserEmail && !currentDisplayName) return false;
                    return isItemOwnedByUser(item, user);
                });

                setListings(myItems);
            } catch (err) {
                console.log("Failed to load listings:", err);
            }
        };

        fetchListings();
    }, [user]);

    const getOffsetLimits = (type, imgWidth, imgHeight, zoom) => {
        const preset = cropPresets[type];
        if (!preset || !imgWidth || !imgHeight) return { maxX: 0, maxY: 0 };

        const fitScale = Math.max(
            preset.previewWidth / imgWidth,
            preset.previewHeight / imgHeight
        );

        const scaledWidth = imgWidth * fitScale * zoom;
        const scaledHeight = imgHeight * fitScale * zoom;

        return {
            maxX: Math.max(0, (scaledWidth - preset.previewWidth) / 2),
            maxY: Math.max(0, (scaledHeight - preset.previewHeight) / 2),
        };
    };

    const clampOffset = (value, max) => Math.max(-max, Math.min(max, value));

    useEffect(() => {
        if (!cropModal.open || !dragging) return;

        const onPointerMove = (e) => {
            const dx = e.clientX - dragStartRef.current.pointerX;
            const dy = e.clientY - dragStartRef.current.pointerY;
            const limits = getOffsetLimits(
                cropModal.type,
                cropModal.imgWidth,
                cropModal.imgHeight,
                cropModal.zoom
            );
            setCropModal((prev) => ({
                ...prev,
                offsetX: clampOffset(dragStartRef.current.offsetX + dx, limits.maxX),
                offsetY: clampOffset(dragStartRef.current.offsetY + dy, limits.maxY),
            }));
        };

        const onPointerUp = () => setDragging(false);

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [cropModal, dragging]);

    const openCropEditor = (file, type) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                setCropModal({
                    open: true,
                    type,
                    src: reader.result,
                    imgWidth: img.width,
                    imgHeight: img.height,
                    zoom: 1,
                    offsetX: 0,
                    offsetY: 0,
                });
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const uploadImage = (e, type) => {
        if (!user) return;

        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";
        openCropEditor(file, type);
    };

    const saveCroppedImage = () => {
        if (!user || !cropModal.src) return;

        const preset = cropPresets[cropModal.type];
        const image = new Image();
        image.onload = () => {
            const fitScale = Math.max(
                preset.previewWidth / image.width,
                preset.previewHeight / image.height
            );

            const scaledWidth = image.width * fitScale * cropModal.zoom;
            const scaledHeight = image.height * fitScale * cropModal.zoom;
            const drawX = (preset.previewWidth - scaledWidth) / 2 + cropModal.offsetX;
            const drawY = (preset.previewHeight - scaledHeight) / 2 + cropModal.offsetY;

            const scaleRatio = scaledWidth / image.width;
            let srcX = (0 - drawX) / scaleRatio;
            let srcY = (0 - drawY) / scaleRatio;
            let srcWidth = preset.previewWidth / scaleRatio;
            let srcHeight = preset.previewHeight / scaleRatio;

            srcX = Math.max(0, srcX);
            srcY = Math.max(0, srcY);
            srcWidth = Math.min(image.width - srcX, srcWidth);
            srcHeight = Math.min(image.height - srcY, srcHeight);

            const canvas = document.createElement("canvas");
            canvas.width = preset.outputWidth;
            canvas.height = preset.outputHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(
                image,
                srcX,
                srcY,
                srcWidth,
                srcHeight,
                0,
                0,
                preset.outputWidth,
                preset.outputHeight
            );

            const output = canvas.toDataURL("image/jpeg", 0.92);
            const profileKey = `profilePic_${user.displayName}`;
            const coverKey = `coverPic_${user.displayName}`;

            if (cropModal.type === "profile") {
                localStorage.setItem(profileKey, output);
                setProfilePic(output);
            } else {
                localStorage.setItem(coverKey, output);
                setCoverPic(output);
            }

            const email = user.email || localStorage.getItem("email") || "";
            if (email) {
                axios.put("http://localhost:8080/api/users/media", {
                    email,
                    profilePicUrl:
                        cropModal.type === "profile"
                            ? output
                            : localStorage.getItem(profileKey) || "",
                    coverPicUrl:
                        cropModal.type === "cover"
                            ? output
                            : localStorage.getItem(coverKey) || "",
                }).catch(() => {
                    // keep local fallback
                });
            }

            setCropModal((prev) => ({ ...prev, open: false }));
        };
        image.src = cropModal.src;
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <BackButton className="back-btn" fallback="/dashboard" label="" />

            <div
                className="profile-cover"
                style={{
                    backgroundImage: coverPic
                        ? `url(${coverPic})`
                        : `url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f")`,
                }}
            >
                <label className="cover-upload">
                    ✎
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadImage(e, "cover")}
                    />
                </label>
            </div>

            <div className="profile-card">
                <div className="profile-avatar-box">
                    {profilePic ? (
                        <img
                            src={profilePic}
                            alt="Profile"
                            className="profile-avatar-img"
                        />
                    ) : (
                        <div className="profile-avatar">
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <label className="avatar-upload">
                        ✎
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadImage(e, "profile")}
                        />
                    </label>
                </div>

                <div className="profile-details">
                    <h2 className="profile-display">{user.displayName}</h2>
                    <p className="profile-fullname">{user.fullName}</p>
                </div>
            </div>

            <section className="profile-content">
                <div className="profile-section-header">
                    <h3>Your Listings</h3>
                    <p>{listings.length} items</p>
                </div>

                {listings.length === 0 ? (
                    <p className="empty-text">No listings yet.</p>
                ) : (
                    <div className="profile-listings">
                        {listings.map((item) => (
                            <div
                                key={item.id}
                                className="listing-card"
                                onClick={() => navigate(`/item/${item.id}`)}
                            >
                                <img
                                    src={getPrimaryImage(item)}
                                    alt={item.title}
                                    className="listing-img"
                                />

                                <div className="listing-info">
                                    <h4>{item.title}</h4>
                                    <p className="listing-price">
                                        ₱{formatPrice(item.price)}
                                    </p>
                                    <p className="listing-category">
                                        {item.category} • {item.condition || "Used"} •{" "}
                                        {getListingAgeLabel(item)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {cropModal.open && (
                <div
                    className="crop-modal-overlay"
                    onClick={() => setCropModal((prev) => ({ ...prev, open: false }))}
                >
                    <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {cropModal.type === "profile"
                                ? "Adjust Profile Photo"
                                : "Adjust Cover Photo"}
                        </h3>
                        <div
                            className={`crop-preview ${
                                cropPresets[cropModal.type].shape === "circle"
                                    ? "circle"
                                    : "rect"
                            }`}
                            style={{
                                width: cropPresets[cropModal.type].previewWidth,
                                height: cropPresets[cropModal.type].previewHeight,
                                cursor: dragging ? "grabbing" : "grab",
                            }}
                            onPointerDown={(e) => {
                                dragStartRef.current = {
                                    pointerX: e.clientX,
                                    pointerY: e.clientY,
                                    offsetX: cropModal.offsetX,
                                    offsetY: cropModal.offsetY,
                                };
                                setDragging(true);
                            }}
                        >
                            <img
                                src={cropModal.src}
                                alt="Crop preview"
                                style={{
                                    width:
                                        cropModal.imgWidth *
                                        Math.max(
                                            cropPresets[cropModal.type].previewWidth /
                                                cropModal.imgWidth,
                                            cropPresets[cropModal.type].previewHeight /
                                                cropModal.imgHeight
                                        ) *
                                        cropModal.zoom,
                                    height:
                                        cropModal.imgHeight *
                                        Math.max(
                                            cropPresets[cropModal.type].previewWidth /
                                                cropModal.imgWidth,
                                            cropPresets[cropModal.type].previewHeight /
                                                cropModal.imgHeight
                                        ) *
                                        cropModal.zoom,
                                    left:
                                        (cropPresets[cropModal.type].previewWidth -
                                            cropModal.imgWidth *
                                                Math.max(
                                                    cropPresets[cropModal.type].previewWidth /
                                                        cropModal.imgWidth,
                                                    cropPresets[cropModal.type].previewHeight /
                                                        cropModal.imgHeight
                                                ) *
                                                cropModal.zoom) /
                                            2 +
                                        cropModal.offsetX,
                                    top:
                                        (cropPresets[cropModal.type].previewHeight -
                                            cropModal.imgHeight *
                                                Math.max(
                                                    cropPresets[cropModal.type].previewWidth /
                                                        cropModal.imgWidth,
                                                    cropPresets[cropModal.type].previewHeight /
                                                        cropModal.imgHeight
                                                ) *
                                                cropModal.zoom) /
                                            2 +
                                        cropModal.offsetY,
                                }}
                            />
                        </div>

                        <div className="crop-controls">
                            <label>
                                Zoom
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.01"
                                    value={cropModal.zoom}
                                    onChange={(e) => {
                                        const zoom = Number(e.target.value);
                                        const limits = getOffsetLimits(
                                            cropModal.type,
                                            cropModal.imgWidth,
                                            cropModal.imgHeight,
                                            zoom
                                        );
                                        setCropModal((prev) => ({
                                            ...prev,
                                            zoom,
                                            offsetX: clampOffset(prev.offsetX, limits.maxX),
                                            offsetY: clampOffset(prev.offsetY, limits.maxY),
                                        }));
                                    }}
                                />
                            </label>

                            <label>
                                Horizontal
                                <input
                                    type="range"
                                    min={
                                        -getOffsetLimits(
                                            cropModal.type,
                                            cropModal.imgWidth,
                                            cropModal.imgHeight,
                                            cropModal.zoom
                                        ).maxX
                                    }
                                    max={
                                        getOffsetLimits(
                                            cropModal.type,
                                            cropModal.imgWidth,
                                            cropModal.imgHeight,
                                            cropModal.zoom
                                        ).maxX
                                    }
                                    step="1"
                                    value={cropModal.offsetX}
                                    onChange={(e) =>
                                        setCropModal((prev) => ({
                                            ...prev,
                                            offsetX: Number(e.target.value),
                                        }))
                                    }
                                />
                            </label>

                            <label>
                                Vertical
                                <input
                                    type="range"
                                    min={
                                        -getOffsetLimits(
                                            cropModal.type,
                                            cropModal.imgWidth,
                                            cropModal.imgHeight,
                                            cropModal.zoom
                                        ).maxY
                                    }
                                    max={
                                        getOffsetLimits(
                                            cropModal.type,
                                            cropModal.imgWidth,
                                            cropModal.imgHeight,
                                            cropModal.zoom
                                        ).maxY
                                    }
                                    step="1"
                                    value={cropModal.offsetY}
                                    onChange={(e) =>
                                        setCropModal((prev) => ({
                                            ...prev,
                                            offsetY: Number(e.target.value),
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <div className="crop-actions">
                            <button
                                type="button"
                                className="crop-btn secondary"
                                onClick={() =>
                                    setCropModal((prev) => ({ ...prev, open: false }))
                                }
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="crop-btn primary"
                                onClick={saveCroppedImage}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
