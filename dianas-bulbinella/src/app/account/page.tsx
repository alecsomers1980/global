import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // layout already redirects, just a safeguard
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || profile?.email || "there";

  return (
    <div className="space-y-8">
      <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-serif text-ink mb-2">
          Welcome back, {displayName}
        </h2>
        <p className="text-sm text-muted">
          From your account dashboard you can manage your personal details, view
          orders, and more.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/account/orders"
          className="bg-paper border border-line rounded-2xl p-6 hover:border-forest transition-colors shadow-sm"
        >
          <h3 className="font-medium text-ink">My orders</h3>
          <p className="text-sm text-muted mt-1">
            Track an order, download invoices, or reorder
          </p>
        </Link>
        <Link
          href="/account/addresses"
          className="bg-paper border border-line rounded-2xl p-6 hover:border-forest transition-colors shadow-sm"
        >
          <h3 className="font-medium text-ink">Addresses</h3>
          <p className="text-sm text-muted mt-1">
            Save delivery details for faster checkout
          </p>
        </Link>
        <Link
          href="/account/wishlist"
          className="bg-paper border border-line rounded-2xl p-6 hover:border-forest transition-colors shadow-sm"
        >
          <h3 className="font-medium text-ink">Favourites</h3>
          <p className="text-sm text-muted mt-1">Products you&apos;ve saved</p>
        </Link>
        <Link
          href="/account/details"
          className="bg-paper border border-line rounded-2xl p-6 hover:border-forest transition-colors shadow-sm"
        >
          <h3 className="font-medium text-ink">My details</h3>
          <p className="text-sm text-muted mt-1">
            Update your name, phone, and password
          </p>
        </Link>
      </div>
    </div>
  );
}
