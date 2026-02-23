import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { WelcomeSection } from "@/components/sections/WelcomeSection";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <WelcomeSection />
                <ServiceGrid />
            </main>
            <Footer />
        </div>
    );
}
