import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { createAdminClient } from "@/utils/supabase/server";

const LOGO_URL = "https://everestmotoring.co.za/images/logo.png";
const WIDTH = 1000;
const HEIGHT = 1414; // A4 portrait ratio (210mm x 297mm)

// Dealership sales contacts printed on the flyer (name in yellow, number in white).
const CONTACTS = [
    { name: "Anton", number: "078 893 8881" },
    { name: "George", number: "082 478 7676" },
];

export async function GET(request, { params }) {
    const { carId } = await params;

    const supabase = await createAdminClient();
    const { data: car, error } = await supabase
        .from("cars")
        .select("id, make, model, year, price, mileage, transmission, fuel_type, colour, manufacturer_colour, main_image_url, gallery_urls, features, status")
        .eq("id", carId)
        .single();

    if (error || !car) {
        return new Response("Car not found", { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";
    // Plain listing link — not associated with any affiliate (no ?ref).
    const listingLink = `${siteUrl}/inventory/${car.id}`;
    const qrDataUrl = await QRCode.toDataURL(listingLink, {
        margin: 1,
        width: 240,
        color: { dark: "#000000", light: "#ffff01" },
    });

    const price = `R ${new Intl.NumberFormat("en-ZA").format(car.price)}`;
    const specRows = [
        car.mileage ? { label: "Mileage", value: `${new Intl.NumberFormat("en-ZA").format(car.mileage)} km` } : null,
        car.transmission ? { label: "Transmission", value: car.transmission } : null,
        car.fuel_type ? { label: "Fuel Type", value: car.fuel_type } : null,
        (car.manufacturer_colour || car.colour) ? { label: "Colour", value: car.manufacturer_colour || car.colour } : null,
    ].filter(Boolean);

    const features = Array.isArray(car.features) ? car.features.slice(0, 9) : [];
    const thumbs = Array.isArray(car.gallery_urls) ? car.gallery_urls.slice(0, 3) : [];
    const isAvailable = car.status === "available";

    const heroHeight = 474;
    const heroGap = 6;
    const mainWidth = 696;
    const thumbsWidth = WIDTH - mainWidth - heroGap;

    return new ImageResponse(
        (
            <div
                style={{
                    width: WIDTH,
                    height: HEIGHT,
                    display: "flex",
                    flexDirection: "column",
                    background: "#ffffff",
                    position: "relative",
                    fontFamily: "Arial, Helvetica, sans-serif",
                }}
            >
                {/* Watermark */}
                <img
                    src={LOGO_URL}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 1000,
                        opacity: 0.05,
                    }}
                />

                {/* 1. Hero */}
                <div style={{ display: "flex", flexShrink: 0, height: heroHeight, gap: heroGap, background: "#000000" }}>
                    <img
                        src={car.main_image_url}
                        style={{ width: mainWidth, height: heroHeight, objectFit: "cover" }}
                    />
                    <div style={{ width: thumbsWidth, display: "flex", flexDirection: "column", gap: heroGap }}>
                        {thumbs.map((url, i) => (
                            <img key={i} src={url} style={{ width: thumbsWidth, flex: 1, objectFit: "cover" }} />
                        ))}
                    </div>
                </div>

                {/* 2. Title / Price */}
                <div
                    style={{
                        display: "flex",
                        flexShrink: 0,
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        padding: "32px 40px 28px 40px",
                        borderBottom: "1px solid #eef2f7",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                            <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: isAvailable ? "#16a34a" : "#d97706" }} />
                            <div style={{ display: "flex", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: isAvailable ? "#16a34a" : "#d97706" }}>
                                {isAvailable ? "Available Now" : "Reserved"}
                            </div>
                        </div>
                        <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "#0f172a", lineHeight: 1.12, letterSpacing: -0.6 }}>
                            {car.year} {car.make} {car.model}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, marginLeft: 24 }}>
                        <div style={{ display: "flex", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#94a3b8", marginBottom: 9 }}>
                            Retail Price
                        </div>
                        <div style={{ display: "flex", alignItems: "center", background: "#0f172a", borderRadius: 12, padding: "13px 26px 13px 22px", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "#ffff01" }} />
                            <div style={{ display: "flex", fontSize: 37, fontWeight: 800, color: "#ffffff", letterSpacing: 0.5, paddingLeft: 8 }}>
                                {price}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Specifications */}
                <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, padding: "26px 36px 0 36px" }}>
                    <div style={{ display: "flex", fontSize: 20, fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Vehicle Specifications
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        {specRows.map((row) => (
                            <div key={row.label} style={{ display: "flex", flexDirection: "column", flex: 1, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: "14px 16px" }}>
                                <div style={{ display: "flex", fontSize: 13, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{row.label}</div>
                                <div style={{ display: "flex", fontSize: 18, color: "#0f172a", fontWeight: 700 }}>{row.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Premium Features */}
                {features.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, padding: "26px 36px 0 36px" }}>
                        <div style={{ display: "flex", fontSize: 20, fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Premium Features
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 0" }}>
                            {features.map((feature, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 11, width: "33.33%" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 12, background: "#0f172a", flexShrink: 0 }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffff01" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <div style={{ display: "flex", fontSize: 16, color: "#334155", fontWeight: 600 }}>{feature}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. CTA */}
                <div style={{ display: "flex", flexShrink: 0, position: "relative", margin: "22px 36px 0 36px", background: "#000000", borderRadius: 18, padding: "24px 36px", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "#ffff01" }} />
                    <div style={{ position: "absolute", top: -90, right: -90, width: 280, height: 280, borderRadius: 140, background: "#ffff01", opacity: 0.12 }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: "#ffffff", marginBottom: 8 }}>
                            Interested in this car?
                        </div>
                        <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1", lineHeight: 1.5, maxWidth: 700 }}>
                            Scan the QR code below to view the full listing online, or call one of our
                            sales executives directly using the numbers below.
                        </div>
                    </div>
                </div>

                {/* 6. Sales Team Contacts (black band, sits directly above the footer) */}
                <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, marginTop: "auto", background: "#000000", padding: "22px 40px", alignItems: "center" }}>
                    <div style={{ display: "flex", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#64748b", marginBottom: 16 }}>
                        Speak To Our Sales Team
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {CONTACTS.map((c, i) => (
                            <div key={c.name} style={{ display: "flex", alignItems: "center" }}>
                                {i > 0 && (
                                    <div style={{ display: "flex", width: 1, height: 46, background: "rgba(255,255,255,0.14)", margin: "0 40px" }} />
                                )}
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 23, border: "1.5px solid rgba(255,255,1,0.45)", flexShrink: 0 }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffff01" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ display: "flex", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#ffff01", marginBottom: 3 }}>{c.name}</div>
                                        <div style={{ display: "flex", fontSize: 25, fontWeight: 700, color: "#ffffff", letterSpacing: 1 }}>{c.number}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. Footer */}
                <div style={{ display: "flex", flexShrink: 0, background: "#000000", borderTop: "1px solid #1f2937", padding: "28px 36px", alignItems: "center", justifyContent: "space-between" }}>
                    <img src={LOGO_URL} style={{ width: 145, height: 113, objectFit: "contain" }} />
                    <div style={{ display: "flex", flexDirection: "column", fontSize: 15, color: "#cbd5e1", lineHeight: 1.9 }}>
                        <div style={{ display: "flex", color: "#ffffff", fontWeight: 700 }}>White River, Mpumalanga</div>
                        <div style={{ display: "flex" }}>013 854 0600 &nbsp;|&nbsp; info@everestmotoring.co.za</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <img src={qrDataUrl} style={{ width: 100, height: 100, borderRadius: 8, border: "3px solid #ffff01" }} />
                        <div style={{ display: "flex", fontSize: 14, color: "#ffff01", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, maxWidth: 130, lineHeight: 1.4 }}>
                            Scan to view &amp; enquire
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: WIDTH,
            height: HEIGHT,
            headers: {
                "Content-Disposition": `attachment; filename="${`${car.year}-${car.make}-${car.model}-Flyer`.replace(/\s+/g, "-")}.png"`,
            },
        }
    );
}
