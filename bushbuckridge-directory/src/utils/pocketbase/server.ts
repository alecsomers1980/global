import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function createClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    try {
      // Load the auth store from the cookie by passing a valid cookie string format
      pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
    } catch (e) {
      console.error('Failed to load auth store from cookie', e);
      pb.authStore.clear();
    }
  }

  // After every request, the authStore can be updated.
  // In PB, we persist this back by exporting to cookie.
  
  return pb;
}
