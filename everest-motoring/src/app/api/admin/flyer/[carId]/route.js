import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { createAdminClient } from "@/utils/supabase/server";

const LOGO_URL = "https://everestmotoring.co.za/images/logo.png";
const WIDTH = 1000;
const HEIGHT = 1414; // A4 portrait ratio (210mm x 297mm)

// Dealership sales contacts printed on the flyer (name in yellow, number in white).
const CONTACTS = [
    { name: "Anton", number: "0788938881" },
    { name: "George", number: "0824787676" },
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
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "28px 36px",
                        borderBottom: "1px solid #f1f5f9",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                display: "flex",
                                background: "#f0fdf4",
                                color: "#15803d",
                                border: "1px solid #bbf7d0",
                                fontSize: 13,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                padding: "5px 12px",
                                borderRadius: 8,
                                marginBottom: 10,
                            }}
                        >
                            {isAvailable ? "Available Now" : "Reserved"}
                        </div>
                        <div style={{ display: "flex", fontSize: 35, fontWeight: 800, color: "#0f172a", maxWidth: 560 }}>
                            {car.year} {car.make} {car.model}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", marginBottom: 8 }}>
                            Retail Price
                        </div>
                        <div style={{ display: "flex", background: "#ffff01", color: "#000000", fontSize: 38, fontWeight: 800, padding: "8px 22px", borderRadius: 10 }}>
                            {price}
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
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, width: "33.33%" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: "#22c55e", color: "#ffffff", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                                        ✓
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
                <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, marginTop: "auto", background: "#000000", padding: "20px 36px", alignItems: "center" }}>
                    <div style={{ display: "flex", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#94a3b8", marginBottom: 12 }}>
                        Speak To Our Sales Team
                    </div>
                    <div style={{ display: "flex", gap: 70 }}>
                        {CONTACTS.map((c) => (
                            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#ffff01" }}>{c.name}</div>
                                <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>{c.number}</div>
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
