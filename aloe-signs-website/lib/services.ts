import {
    Truck, Building2, Store, MapPin, Frame, FileText, Tag, PenTool,
    Car, Lightbulb, Palette, Shield, CheckCircle, Users, Clock, Award,
    Maximize, Image, Flag, AlertTriangle, Speaker, Boxes, Package, Target
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ServiceData {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    features: {
        icon: LucideIcon;
        title: string;
        description: string;
    }[];
    process: {
        number: string;
        title: string;
        description: string;
    }[];
    benefits: string[];
}

export const services: ServiceData[] = [
    {
        slug: 'billboards',
        title: 'Billboards',
        tagline: 'Make a big impact',
        description: 'Large-scale outdoor advertising that gets noticed. Dominate the landscape with massive outdoor formats.',
        features: [
            { icon: Image, title: 'Billboard Printing', description: 'Large-format printing for roadside billboards and advertising structures.' },
            { icon: Building2, title: 'Structural Safety', description: 'Engineered for durability and weather resistance.' },
            { icon: Flag, title: 'High Visibility', description: 'Strategic design for optimal impact from roads.' },
            { icon: Shield, title: 'UV Protection', description: 'Fade-resistant inks that last under the harsh sun.' },
            { icon: Target, title: 'Location Assessment', description: 'Expert advice on positioning and scale.' },
            { icon: Users, title: 'Campaign Management', description: 'Regular updates for ongoing marketing campaigns.' }
        ],
        process: [
            { number: '1', title: 'Site Evaluation', description: 'We assess the location, size requirements, and mounting options.' },
            { number: '2', title: 'Design for Distance', description: 'Graphics optimized for visibility from specific viewing distances.' },
            { number: '3', title: 'Large Format Production', description: 'Printed on weather-resistant materials with UV protection.' },
            { number: '4', title: 'Professional Installation', description: 'Safe installation by trained teams with proper equipment and permits.' }
        ],
        benefits: ['Large-format printing up to 5m wide', 'Weather-resistant materials', 'UV-protected inks for longevity', 'Structural engineering for large installations', 'Permit application assistance', 'Nationwide installation']
    },
    {
        slug: 'building-wraps',
        title: 'Building wraps & XXL needs',
        tagline: 'Transform your architectural space into massive visual assets',
        description: 'Complete building transformations and extra-large format printing for monumental impact.',
        features: [
            { icon: Building2, title: 'Full Facade Coverage', description: 'Turn your entire building into a branded masterpiece.' },
            { icon: Maximize, title: 'XXL Printing', description: 'Capabilities that handle the largest possible formats.' },
            { icon: Shield, title: 'Weather Resistance', description: 'Durable mesh and PVC that withstand harsh weather.' },
            { icon: Users, title: 'Expert Riggers', description: 'Specialized installation teams trained for heights.' },
            { icon: Lightbulb, title: 'Mesh Solutions', description: 'Allow light in and wind through with specialized mesh.' },
            { icon: Palette, title: 'Vibrant Colors', description: 'Colors that pop even from a distance.' }
        ],
        process: [
            { number: '1', title: 'Site Survey', description: 'Thorough evaluation of the building structure and surrounding environment.' },
            { number: '2', title: 'Structural Engineering', description: 'Calculations to ensure safe installation and wind load management.' },
            { number: '3', title: 'Panel Printing', description: 'Printing in expertly divided panels for seamless joining.' },
            { number: '4', title: 'Rigging', description: 'Installation by certified rope access technicians.' }
        ],
        benefits: ['Monumental brand visibility', 'Specialized wind-resistant mesh', 'Certified installation experts', 'Permit and engineering assistance', 'Long-lasting UV inks', 'Seamless panel joints']
    },
    {
        slug: 'bulk-orders-screen-printing',
        title: 'Bulk orders & screen printing',
        tagline: 'Quality printing for apparel, banners, and gear',
        description: 'Professional high-volume commercial screen printing and bulk production solutions.',
        features: [
            { icon: Tag, title: 'Apparel Printing', description: 'Custom t-shirts, uniforms, and workwear with vibrant prints.' },
            { icon: Users, title: 'High Volume', description: 'Capability to handle massive bulk orders quickly.' },
            { icon: Palette, title: 'Spot Color Matching', description: 'Exact brand color matching for consistent corporate identity.' },
            { icon: Package, title: 'Merchandise', description: 'Printing on bags, accessories, and various promotional merchandise.' },
            { icon: Shield, title: 'Durable Prints', description: 'Wash-fast prints that stand the test of time and industrial wear.' },
            { icon: Clock, title: 'Fast Turnaround', description: 'Efficient production lines for tight deadline deliveries.' }
        ],
        process: [
            { number: '1', title: 'Artwork Optimization', description: 'Refining designs specifically for the screen printing process.' },
            { number: '2', title: 'Screen Preparation', description: 'Creating precise screens for each color layer.' },
            { number: '3', title: 'Sample Runs', description: 'Producing and approving a physical sample before bulk run.' },
            { number: '4', title: 'Bulk Production', description: 'Rapid, consistent printing across the entire order quantity.' }
        ],
        benefits: ['Cost-effective for high volumes', 'Extremely durable prints', 'Exact corporate color matching', 'Wide range of print substrates', 'Fast production times', 'Dedicated account management']
    },
    {
        slug: 'fleet-maintenance-branding',
        title: 'Fleet maintenance & branding',
        tagline: 'Turn your fleet into moving billboards',
        description: 'Comprehensive fleet branding programs, from single vehicles to national fleets.',
        features: [
            { icon: Car, title: 'Full & Partial Wraps', description: 'Complete or partial transformations to suit your budget.' },
            { icon: Truck, title: 'Fleet Consistency', description: 'Exact replication of branding across varied vehicle models.' },
            { icon: Shield, title: 'Paint Protection', description: 'Vinyl wraps that protect the underlying bodywork.' },
            { icon: PenTool, title: 'Decals & Lettering', description: 'Clean, professional cut vinyl branding.' },
            { icon: Users, title: ' nationwide Rollouts', description: 'Coordinated branding updates across the country.' },
            { icon: CheckCircle, title: 'Maintenance Plans', description: 'Repair and replacement programs for damaged graphics.' }
        ],
        process: [
            { number: '1', title: 'Fleet Audit', description: 'Assessing your vehicle types and designing templates for each.' },
            { number: '2', title: 'Design Adaptation', description: 'Ensuring your brand works perfectly on every vehicle shape.' },
            { number: '3', title: 'Production Scheduling', description: 'Coordinating printing to match vehicle availability.' },
            { number: '4', title: 'Application', description: 'Application by certified technicians in controlled environments.' }
        ],
        benefits: ['Mobile advertising that pays for itself', 'Protects vehicle resale value', 'Consistent brand image nationwide', 'Premium cast vinyl materials', 'Certified installation warranties', 'Dedicated maintenance support']
    },
    {
        slug: 'promo-items',
        title: 'Promo Items',
        tagline: 'Keep your brand in their hands',
        description: 'Custom promotional merchandise that builds lasting relationships with your clients.',
        features: [
            { icon: Package, title: 'Corporate Gifts', description: 'High-end branded gifts for key clients and partners.' },
            { icon: Tag, title: 'Event Giveaways', description: 'Cost-effective items for mass distribution at exhibitions.' },
            { icon: Users, title: 'Onboarding Kits', description: 'Welcome packages for new employees or VIP customers.' },
            { icon: Palette, title: 'Custom Sourcing', description: 'Finding the exact unique items that tell your brand story.' },
            { icon: Tag, title: 'Various Print Methods', description: 'Pad printing, engraving, embroidery, and UV printing.' },
            { icon: Package, title: 'Packaging', description: 'Custom branded presentation packaging for your items.' }
        ],
        process: [
            { number: '1', title: 'Needs Analysis', description: 'Understanding your target audience, budget, and objective.' },
            { number: '2', title: 'Product Curation', description: 'Providing a tailored list of impactful promotional items.' },
            { number: '3', title: 'Mockups & Samples', description: 'Creating visual mockups and sourcing physical samples.' },
            { number: '4', title: 'Production & Delivery', description: 'Quality-controlled branding and bulk delivery.' }
        ],
        benefits: ['Tangible brand connection', 'High ROI on brand recall', 'Vast range of product options', 'Options for any budget', 'Expert branding advice', 'End-to-end fulfillment']
    },
    {
        // Re-using Printer and Box that were accidentally omitted from imports? Let's fix that below if needed.
        // But wait! Printer and Box are not imported from lucide-react. I should stick to imported ones.
        slug: 'wall-art',
        title: 'Wall art',
        tagline: 'Custom internal wall art and murals',
        description: 'Vibrant office branding, custom wallpapers, and architectural wall graphics.',
        features: [
            { icon: Image, title: 'Custom Wallpaper', description: 'Bespoke printed wallpaper tailored exactly to your walls.' },
            { icon: Palette, title: 'Vinyl Murals', description: 'High-impact graphics applied directly to wall surfaces.' },
            { icon: CheckCircle, title: 'Acoustic Panels', description: 'Branded panels that also dampen room echo.' },
            { icon: Target, title: '3D Wall Elements', description: 'Incorporating dimensional lettering into wall designs.' },
            { icon: Building2, title: 'Office Branding', description: 'Injecting company culture and values into workspaces.' },
            { icon: Shield, title: 'Durable Finishes', description: 'Scuff-resistant laminates for high-traffic areas.' }
        ],
        process: [
            { number: '1', title: 'Space Evaluation', description: 'Measuring walls and assessing surface paint capability.' },
            { number: '2', title: 'Creative Design', description: 'Collaborating to create designs that fit the space and culture.' },
            { number: '3', title: 'High-Res Printing', description: 'Printing on premium architectural vinyls and papers.' },
            { number: '4', title: 'Precision Installation', description: 'Flawless application by experienced installers.' }
        ],
        benefits: ['Transforms boring workspaces', 'Boosts employee morale', 'Impresses visiting clients', 'Tailorable to exact dimensions', 'Washable and durable finishes', 'Seamless panel matching']
    },
    {
        slug: 'set-building-strike',
        title: 'Set building & strike',
        tagline: 'Bringing creative visions to life',
        description: 'Custom set construction, scenic props for events, and complete strike services.',
        features: [
            { icon: PenTool, title: 'Custom Fabrication', description: 'Building bespoke elements from wood, metal, and acrylic.' },
            { icon: Frame, title: 'Event Stages', description: 'Designing and building impactful stage backdrops.' },
            { icon: Target, title: 'Scenic Props', description: 'Creating specific 3D models and props for shoots or events.' },
            { icon: Maximize, title: 'Modular Systems', description: 'Structures that can be reused or reconfigured.' },
            { icon: Users, title: 'Theatrical Quality', description: 'Finishes designed to look perfect under professional lighting.' },
            { icon: Clock, title: 'Efficient Strike', description: 'Rapid, safe dismantling and removal post-event.' }
        ],
        process: [
            { number: '1', title: 'Concept review', description: 'Analyzing blueprints, sketches, and event requirements.' },
            { number: '2', title: 'Workshop Build', description: 'Pre-fabricating the majority of elements in our controlled workshop.' },
            { number: '3', title: 'On-site Assembly', description: 'Rapid installation at the event venue.' },
            { number: '4', title: 'Strike & Removal', description: 'Professional pack-down once the event concludes.' }
        ],
        benefits: ['Complete end-to-end service', 'Expert finish quality', 'Safe, structural integrity', 'Rapid venue turnaround', 'Creative problem solving', 'In-house manufacturing']
    },
    {
        slug: '3d-renders',
        title: '3D Renders',
        tagline: 'Navigate your vision before production',
        description: 'Stunning 3D visualisations and architectural renders for signage and spatial design.',
        features: [
            { icon: Maximize, title: 'Photorealistic Mockups', description: 'See exactly how your signage will look in situ.' },
            { icon: Building2, title: 'Spatial Planning', description: 'Visualize flow and wayfinding in architectural spaces.' },
            { icon: Lightbulb, title: 'Day/Night Views', description: 'Simulate illumination to test lighting and visibility.' },
            { icon: MapPin, title: 'Fly-throughs', description: 'Animated tours of proposed environments.' },
            { icon: Palette, title: 'Material Simulation', description: 'Accurate representation of finishes, metals, and acrylics.' },
            { icon: CheckCircle, title: 'Proof of Concept', description: 'Validate designs with stakeholders before spending on production.' }
        ],
        process: [
            { number: '1', title: 'Briefing & Reference Gathering', description: 'Collecting photos of the existing space and design plans.' },
            { number: '2', title: 'Modeling', description: 'Building the environment and the signage elements in 3D space.' },
            { number: '3', title: 'Texturing & Lighting', description: 'Applying accurate materials and realistic lighting scenarios.' },
            { number: '4', title: 'Final Render', description: 'Providing high-resolution images or videos for approval.' }
        ],
        benefits: ['Eliminates guesswork', 'Speeds up stakeholder approval', 'Identifies potential issues early', 'Aids in permit applications', 'Sets accurate expectations', 'Hyper-realistic quality']
    },
    {
        slug: 'tangible-visual-texture',
        title: 'Tangible Visual Texture',
        tagline: 'Signage you can feel',
        description: 'Premium storefront branding and signage incorporating unique tactile textures.',
        features: [
            { icon: Palette, title: 'Textured Vinyls', description: 'Woodgrain, carbon fiber, brushed metal, and leather-look finishes.' },
            { icon: PenTool, title: 'Layered Acrylics', description: 'Building depth through stacked, precision-cut materials.' },
            { icon: Maximize, title: 'Embossing & Routing', description: 'CNC routed details that create physical depth and shadows.' },
            { icon: Shield, title: 'Specialty Coatings', description: 'Matte, gloss, and soft-touch finishes.' },
            { icon: Award, title: 'Premium Branding', description: 'Elevate your brand beyond standard flat printing.' },
            { icon: Store, title: 'Tactile Experience', description: 'Signage that invites physical interaction.' }
        ],
        process: [
            { number: '1', title: 'Material Consultation', description: 'Exploring our sample library to find the perfect texture.' },
            { number: '2', title: 'Design for Depth', description: 'Creating artwork specifically tailored for multi-layered production.' },
            { number: '3', title: 'Precision Fabrication', description: 'Using CNC routers and specialized finishing techniques.' },
            { number: '4', title: 'Installation', description: 'Careful mounting to highlight the dimensional elements.' }
        ],
        benefits: ['Stands out in a crowded market', 'Conveys extreme premium quality', 'Engages multiple senses', 'Highly durable composite materials', 'Bespoke aesthetic', 'Cannot be easily replicated']
    },
    {
        slug: 'regulatory-signs',
        title: 'Plant/Mines Regulatory Signs',
        tagline: 'Compliant safety signage you can rely on',
        description: 'Durable, fully compliant safety and regulatory signage for industrial environments.',
        features: [
            { icon: AlertTriangle, title: 'Hazard Warnings', description: 'Clear, universally understood danger and warning signs.' },
            { icon: CheckCircle, title: 'Compliance Signs', description: 'Signage conforming exactly to national mining and safety standards.' },
            { icon: Shield, title: 'Extreme Durability', description: 'Manufactured to survive harsh industrial and chemical environments.' },
            { icon: Lightbulb, title: 'Reflective/Photoluminescent', description: 'Signs that remain visible in low-light or emergency situations.' },
            { icon: MapPin, title: 'Site Evacuation Maps', description: 'Clear, durable maps for emergency procedures.' },
            { icon: Users, title: 'Traffic Management', description: 'Heavy machinery and vehicular control signage.' }
        ],
        process: [
            { number: '1', title: 'Audit & Compliance Check', description: 'Reviewing site requirements against current safety legislation.' },
            { number: '2', title: 'Material Selection', description: 'Choosing substrates like Chromadek or Aluminum based on conditions.' },
            { number: '3', title: 'Manufacturing', description: 'Producing signs with UV-protective and chemical-resistant laminates.' },
            { number: '4', title: 'Strategic Placement', description: 'Installing signs at correct heights and locations for maximum compliance.' }
        ],
        benefits: ['Ensures legal compliance', 'Enhances worker safety', 'Withstands extreme environments', 'Fade and chemical resistant', 'Bulk supply capabilities', 'Reflective options available']
    },
    {
        slug: 'site-activations',
        title: 'Site Activations',
        tagline: 'Complete experiential transformations',
        description: 'End-to-end site branding and activations that leave a lasting unmissable impact.',
        features: [
            { icon: Flag, title: 'Event Branding', description: 'Comprehensive branding across all venue touchpoints.' },
            { icon: Store, title: 'Pop-up Shops', description: 'Temporary retail structures and branding containers.' },
            { icon: Users, title: 'Experiential Zones', description: 'Interactive spaces designed to engage consumers.' },
            { icon: Image, title: 'Temporary Structures', description: 'Branded gazebos, domes, and activation pods.' },
            { icon: CheckCircle, title: 'Logistics', description: 'Managing the delivery and setup of complex multi-element campaigns.' },
            { icon: Clock, title: 'Rapid Deployment', description: 'Quick setup times for overnight venue transformations.' }
        ],
        process: [
            { number: '1', title: 'Activation Strategy', description: 'Mapping consumer journeys and branding opportunities.' },
            { number: '2', title: 'Kit Production', description: 'Manufacturing all elements required for the activation.' },
            { number: '3', title: 'Deployment', description: 'Delivering and setting up the activation on tight schedules.' },
            { number: '4', title: 'Strike & Storage', description: 'Dismantling and storing elements for future activations.' }
        ],
        benefits: ['Maximum brand immersion', 'Single-supplier convenience', 'Scalable solutions', 'Reusable activation kits', 'High consumer engagement', 'Expert logistics management']
    }
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
    return services.find((service) => service.slug === slug);
}

export function getAllServiceSlugs(): string[] {
    return services.map((service) => service.slug);
}
