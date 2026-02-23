import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingForm } from "@/components/portal/BookingForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function PublicBookingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If not logged in, redirect to login with a return path
    if (!user) {
        redirect("/login?redirect=/book");
    }

    // User is authenticated — show the booking form
    const { data: attorneys } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "attorney");

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-gray-50">
                <section className="bg-brand-navy py-12 text-center text-white">
                    <div className="container">
                        <h1 className="text-4xl font-serif font-bold mb-2">Book a Consultation</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Schedule a secure session with one of our legal professionals.
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container max-w-4xl">
                        <Link href="/">
                            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-gold">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                            </Button>
                        </Link>

                        <BookingForm
                            attorneys={attorneys || []}
                            userId={user.id}
                        />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
