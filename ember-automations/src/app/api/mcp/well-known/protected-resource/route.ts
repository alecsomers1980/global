import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from 'mcp-handler';

const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.emb3r.co.za';

// RFC 9728 — tells Claude which authorization server guards /mcp. Aloe is both
// the resource server and the authorization server.
export const GET = protectedResourceHandler({ authServerUrls: [origin] });
export const OPTIONS = metadataCorsOptionsRequestHandler();
