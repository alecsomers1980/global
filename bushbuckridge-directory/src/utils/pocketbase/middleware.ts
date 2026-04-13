import { NextResponse, type NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function updateSession(request: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

  // load the store from a cookie
  const authCookie = request.cookies.get('pb_auth');
  if (authCookie) {
    try {
      pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
    } catch (e) {
      pb.authStore.clear();
    }
  }

  // refresh the session if needed
  try {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch (e) {
    pb.authStore.clear();
  }

  const response = NextResponse.next();

  // send back the cookie to the client
  response.headers.append('set-cookie', pb.authStore.exportToCookie());

  return response;
}
