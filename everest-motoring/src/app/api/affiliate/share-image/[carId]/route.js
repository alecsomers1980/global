import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { createAdminClient } from "@/utils/supabase/server";

export async function GET(request, { params }) {
    const { carId } = await params;
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref") || "";

    const supabase = await createAdminClient();
    const { data: car, error } = await supabase
        .from("cars")
        .select("id, make, model, year, price, mileage, transmission, fuel_type, main_image_url")
        .eq("id", carId)
        .single();

    if (error || !car) {
        return new Response("Car not found", { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";
    const trackingLink = `${siteUrl}/inventory/${car.id}${ref ? `?ref=${ref}` : ""}`;
    const qrDataUrl = await QRCode.toDataURL(trackingLink, {
        margin: 1,
        width: 220,
        color: { dark: "#000000", light: "#ffff01" },
    });

    const price = `R ${new Intl.NumberFormat("en-ZA").format(car.price)}`;
    const specs = [
        car.mileage ? `${new Intl.NumberFormat("en-ZA").format(car.mileage)} km` : null,
        car.transmission,
        car.fuel_type,
    ].filter(Boolean);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1080px",
                    height: "1080px",
                    display: "flex",
                    flexDirection: "column",
                    background: "#000000",
                    fontFamily: "Arial, Helvetica, sans-serif",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "32px",
                        borderBottom: "6px solid #ffff01",
                    }}
                >
                    <span style={{ color: "#ffff01", fontSize: 34, fontWeight: 700, letterSpacing: 4 }}>
                        EVEREST MOTORING
                    </span>
                </div>

                {/* Car image */}
                <div style={{ display: "flex", padding: "32px 32px 0 32px" }}>
                    <img
                        src={car.main_image_url}
                        width={1016}
                        height={560}
                        style={{ objectFit: "cover", borderRadius: 24 }}
                    />
                </div>

                {/* Spec block */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "32px 48px 0 48px",
                    }}
                >
                    <span style={{ color: "#ffffff", fontSize: 44, fontWeight: 700 }}>
                        {car.year} {car.make} {car.model}
                    </span>
                    <span style={{ color: "#ffff01", fontSize: 56, fontWeight: 800, marginTop: 8 }}>
                        {price}
                    </span>
                    <div style={{ display: "flex", marginTop: 16 }}>
                        <span style={{ color: "#a3a3a3", fontSize: 28 }}>
                            {specs.join("  •  ")}
                        </span>
                    </div>
                </div>

                {/* Footer: QR + tracking link */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "auto",
                        padding: "32px 48px",
                        background: "#111111",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "#ffff01", fontSize: 22, fontWeight: 700 }}>
                            SCAN TO VIEW &amp; ENQUIRE
                        </span>
                        <span style={{ color: "#a3a3a3", fontSize: 18, marginTop: 6 }}>
                            everestmotoring.co.za
                        </span>
                    </div>
                    <img src={qrDataUrl} width={150} height={150} style={{ borderRadius: 8 }} />
                </div>
            </div>
        ),
        { width: 1080, height: 1080 }
    );
}
