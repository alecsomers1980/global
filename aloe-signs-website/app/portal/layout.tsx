import './portal.css';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-inter text-white">

            
            <div className="portal-bg-canvas">
                <div className="grid-overlay" />
            </div>
            
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
