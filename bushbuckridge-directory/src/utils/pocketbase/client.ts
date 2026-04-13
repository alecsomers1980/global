import PocketBase from 'pocketbase';

export function createClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  
  // You might want to auto-load the auth store from cookies here eventually
  // but usually simple initialization is enough for client components.
  
  return pb;
}
