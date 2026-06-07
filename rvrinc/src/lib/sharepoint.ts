const TENANT_ID = process.env.SHAREPOINT_TENANT_ID!;
const CLIENT_ID = process.env.SHAREPOINT_CLIENT_ID!;
const CLIENT_SECRET = process.env.SHAREPOINT_CLIENT_SECRET!;
const SITE_URL = process.env.SHAREPOINT_SITE_URL!;
const CASE_FOLDER = process.env.SHAREPOINT_CASE_FOLDER || "KC RAF files";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
        return cachedToken.token;
    }

    const res = await fetch(
        `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                scope: "https://graph.microsoft.com/.default",
            }),
        }
    );

    if (!res.ok) {
        throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    };
    return data.access_token;
}

async function graphGet(path: string, step: string) {
    const token = await getAccessToken();
    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Graph API ${step} failed (${res.status}): ${text}`);
    }
    return res.json();
}

export interface SharePointFile {
    name: string;
    webUrl: string;
    size: number;
    lastModified: string;
    mimeType: string;
}

let cachedDriveId: string | null = null;

async function getDriveId(): Promise<string> {
    if (cachedDriveId) return cachedDriveId;

    const url = new URL(SITE_URL);
    const hostname = url.hostname;

    let site: any;
    // Try multiple resolution strategies
    const attempts = [
        // Strategy 1: hostname:/sites/site-name
        `/sites/${hostname}:/sites/RVR`,
        // Strategy 2: hostname only (root site)
        `/sites/${hostname}`,
        // Strategy 3: search by display name
        `/sites?search=RVR`,
    ];

    for (const path of attempts) {
        try {
            if (path.startsWith("/sites?search=")) {
                const result = await graphGet(path, "search sites");
                site = result.value?.[0];
            } else {
                site = await graphGet(path, "resolve site");
            }
            if (site?.id) break;
        } catch {
            continue;
        }
    }

    if (!site?.id) throw new Error("Could not resolve SharePoint site. Check SHAREPOINT_SITE_URL.");

    const drives = await graphGet(`/sites/${site.id}/drives`, "list drives");

    // Try "Documents" first, then any document library
    const drive = drives.value?.find(
        (d: any) => d.driveType === "documentLibrary" && d.name === "Documents"
    ) || drives.value?.find((d: any) => d.driveType === "documentLibrary")
    || drives.value?.[0];

    if (!drive) throw new Error("No document library found on SharePoint site");
    cachedDriveId = drive.id;
    return drive.id;
}

export async function listCaseFiles(caseNumber: string): Promise<{
    files: SharePointFile[];
    folderUrl: string;
    error?: string;
}> {
    try {
        const driveId = await getDriveId();

        // Try the case folder path
        let folderData: any = { value: [] };
        try {
            folderData = await graphGet(
                `/sites/root/drives/${driveId}/root:/${encodeURIComponent(CASE_FOLDER)}:/children?$top=999`,
                "list case folders"
            );
        } catch {
            return { files: [], folderUrl: SITE_URL, error: "Case files folder not found in SharePoint." };
        }

        const matchingFolder = (folderData.value || []).find(
            (item: any) => item.folder && item.name.toLowerCase().includes(caseNumber.toLowerCase())
        );

        if (!matchingFolder) {
            return { files: [], folderUrl: SITE_URL, error: "No folder found for this case." };
        }

        // List files inside the matching subfolder
        const fileData = await graphGet(
            `/sites/root/drives/${driveId}/items/${matchingFolder.id}/children?$top=999`,
            "list files"
        );

        const caseFiles: SharePointFile[] = (fileData.value || [])
            .filter((item: any) => !item.folder && item.file)
            .map((item: any) => ({
                name: item.name,
                webUrl: item.webUrl || item["@microsoft.graph.downloadUrl"] || "",
                size: item.size || 0,
                lastModified: item.lastModifiedDateTime || "",
                mimeType: item.file?.mimeType || "application/octet-stream",
            }));

        const folderUrl = `${SITE_URL}/${encodeURIComponent(CASE_FOLDER).replace(/%2F/g, "/")}/${encodeURIComponent(matchingFolder.name)}`;

        return { files: caseFiles, folderUrl };
    } catch (err: any) {
        return { files: [], folderUrl: "", error: `SharePoint error: ${err.message}` };
    }
}

export function getCaseFolderUrl(caseNumber: string): string {
    return `${SITE_URL}/${CASE_FOLDER}/${caseNumber}`;
}
