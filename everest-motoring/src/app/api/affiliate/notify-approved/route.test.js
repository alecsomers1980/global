import { describe, it, expect, vi, beforeEach } from "vitest";

let mockCar = null;
let mockAffiliates = [];
let mockAffiliatesError = null;
const sendEmailCalls = [];
let sendEmailResults = [];

function makeQueryBuilder(result) {
    const builder = {
        select: () => builder,
        eq: () => builder,
        not: () => builder,
        maybeSingle: async () => result,
        then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return builder;
}

vi.mock("@/utils/supabase/server", () => ({
    createAdminClient: async () => ({
        from: (table) => {
            if (table === "cars") return makeQueryBuilder({ data: mockCar, error: null });
            if (table === "profiles") return makeQueryBuilder({ data: mockAffiliates, error: mockAffiliatesError });
            throw new Error(`Unexpected table: ${table}`);
        },
    }),
}));

vi.mock("@/lib/resend", () => ({
    sendEmail: async (args) => {
        sendEmailCalls.push(args);
        return sendEmailResults.shift() ?? { success: true };
    },
}));

const { POST } = await import("./route");

function makeRequest(body, headers = {}) {
    const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    return {
        headers: { get: (key) => lower[key.toLowerCase()] ?? null },
        json: async () => body,
    };
}

beforeEach(() => {
    mockCar = {
        id: "car-1",
        make: "Toyota",
        model: "Hilux",
        year: 2024,
        price: 749900,
        mileage: 12500,
        main_image_url: "https://example.com/hilux.jpg",
        video_url: null,
    };
    mockAffiliates = [];
    mockAffiliatesError = null;
    sendEmailCalls.length = 0;
    sendEmailResults = [];
    process.env.AFFILIATE_NOTIFY_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://everestmotoring.co.za";
});

describe("POST /api/affiliate/notify-approved", () => {
    it("rejects a request with a missing or wrong bearer secret", async () => {
        const res = await POST(makeRequest({ carId: "car-1" }, { authorization: "Bearer wrong" }));
        expect(res.status).toBe(401);
        expect(sendEmailCalls).toHaveLength(0);
    });

    it("emails every approved affiliate with their own tracking ref", async () => {
        mockAffiliates = [
            { id: "a1", first_name: "Jane", email: "jane@example.com", affiliate_code: "JANEAB12" },
            { id: "a2", first_name: "Sam", email: "sam@example.com", affiliate_code: "SAMCD34" },
        ];
        sendEmailResults = [{ success: true }, { success: true }];

        const res = await POST(makeRequest({ carId: "car-1" }, { authorization: "Bearer test-secret" }));
        const body = await res.json();

        expect(body).toEqual({ success: true, notified: 2 });
        expect(sendEmailCalls).toHaveLength(2);
        expect(sendEmailCalls[0].to).toBe("jane@example.com");
        expect(sendEmailCalls[1].to).toBe("sam@example.com");
    });

    it("continues sending to the rest when one affiliate's send fails", async () => {
        mockAffiliates = [
            { id: "a1", first_name: "Jane", email: "jane@example.com", affiliate_code: "JANEAB12" },
            { id: "a2", first_name: "Sam", email: "sam@example.com", affiliate_code: "SAMCD34" },
        ];
        sendEmailResults = [{ success: false, error: "bounced" }, { success: true }];

        const res = await POST(makeRequest({ carId: "car-1" }, { authorization: "Bearer test-secret" }));
        const body = await res.json();

        expect(body).toEqual({ success: true, notified: 1 });
        expect(sendEmailCalls).toHaveLength(2);
    });

    it("404s when the car doesn't exist", async () => {
        mockCar = null;
        const res = await POST(makeRequest({ carId: "missing" }, { authorization: "Bearer test-secret" }));
        expect(res.status).toBe(404);
    });
});
