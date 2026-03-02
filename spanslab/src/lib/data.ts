export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    categoryId: "rib-and-block" | "paving" | "building-materials";
    image: string;
    images: string[];
    features: string[];
    specs: { label: string; value: string }[];
    usage?: string[];
    advantages?: { title: string; description: string }[];
}

export const products: Product[] = [
    {
        id: "1",
        slug: "cement-stock-bricks",
        name: "Cement Stock Bricks",
        description: "The reliable standard for all construction. Our cement stock bricks offer excellent compressive strength and a rough texture for superior mortar adhesion.",
        category: "Bricks & Blocks",
        categoryId: "building-materials",
        image: "/images/cement-stock.jpg",
        images: [],
        features: [
            "7 MPa - 10 MPa strength",
            "High quality standards",
            "Ideal for plastered walls",
            "Consistent size and shape",
        ],
        specs: [
            { label: "Dimensions", value: "222 x 106 x 73mm" },
            { label: "Weight", value: "2.3kg - 3.0kg" },
            { label: "Units per m²", value: "52-55" },
            { label: "Material", value: "Concrete" },
        ],
        usage: [
            "Internal and external walls",
            "Single and double-story buildings",
            "Boundary walls and retaining structures",
            "Foundations and footings (7 MPa recommended)",
        ],
        advantages: [
            { title: "Plaster Key", description: "Rough texture provides excellent adhesion for plaster and mortar." },
            { title: "Durability", description: "Engineered to withstand South African weather conditions." },
        ],
    },
    {
        id: "2",
        slug: "maxi-bricks",
        name: "Maxi Bricks",
        description: "Efficiency and strength for faster builds. Maxi bricks reduce labor costs by up to 30% due to their larger size while providing robust structural integrity.",
        category: "Bricks & Blocks",
        categoryId: "building-materials",
        image: "/images/cement-stock.jpg",
        images: [],
        features: [
            "Faster installation time",
            "Reduced mortar consumption",
            "7 MPa - 14 MPa strength",
            "Excellent thermal mass",
        ],
        specs: [
            { label: "Dimensions", value: "290 x 140 x 90mm" },
            { label: "Weight", value: "3.5kg - 5.0kg" },
            { label: "Units per m²", value: "33 (Single Skin)" },
            { label: "Standards", value: "High Grade" },
        ],
        usage: [
            "Single-wall construction",
            "External boundary walls",
            "Load-bearing walling",
            "Commercial and industrial builds",
        ],
        advantages: [
            { title: "Cost Efficiency", description: "Larger size means fewer units per m², reducing labor and mortar costs." },
            { title: "Thermal Insulation", description: "Increased width provides better temperature regulation inside buildings." },
        ],
    },
    {
        id: "3",
        slug: "hollow-blocks",
        name: "Hollow Blocks",
        description: "Modern structural solutions for residential and commercial projects. Hollow cores allow for reinforcement and concrete filling for maximum strength.",
        category: "Bricks & Blocks",
        categoryId: "building-materials",
        image: "https://images.unsplash.com/photo-1590486803833-1c5c65d56d3a?q=80&w=800&auto=format&fit=crop",
        images: [],
        features: [
            "Structural versatility",
            "Lightweight handling",
            "Improved insulation",
            "Accommodates reinforcement",
        ],
        specs: [
            { label: "Width Options", value: "90mm / 140mm / 190mm" },
            { label: "Standard Length", value: "390mm" },
            { label: "Height", value: "190mm" },
            { label: "Strength", value: "3.5 MPa - 7 MPa" },
        ],
        usage: [
            "Internal partition walls (90mm)",
            "Standard residential walls (140mm)",
            "Heavy-duty structural walls (190mm)",
            "Beam-and-block flooring systems",
        ],
        advantages: [
            { title: "Reinforcement Ready", description: "Hollow cores are designed to accommodate rebar and concrete grout." },
            { title: "Insulation", description: "Internal air voids provide enhanced thermal and acoustic properties." },
        ],
    },
    {
        id: "4",
        slug: "rib-and-block-system",
        name: "Rib & Block Slab System",
        description: "The lightweight suspended floor specialist. Our rib and block system is 40% lighter than traditional insitu slabs, making it the preferred choice for multi-story builds.",
        category: "Slabs",
        categoryId: "rib-and-block",
        image: "/images/rib.jpg",
        images: [],
        features: [
            "Quick installation",
            "No heavy equipment needed",
            "Polystyrene option for insulation",
            "Quality approved components",
        ],
        specs: [
            { label: "Rib Strength", value: "40 MPa (Pre-stressed)" },
            { label: "Block Strength", value: "10 MPa" },
            { label: "Span Capacity", value: "Up to 6.5m (Standard)" },
            { label: "Reinforcement", value: "Ref 100 Mesh" },
        ],
        usage: [
            "First floor slabs",
            "Roof slabs",
            "Multi-story developments",
            "Extensions where weight is a concern",
        ],
        advantages: [
            { title: "No Cranes Required", description: "Components are handled manually, eliminating expensive lifting equipment." },
            { title: "Structural Integrity", description: "Pre-stressed ribs ensure superior load-bearing capacity and minimal deflection." },
        ],
    },
    {
        id: "5",
        slug: "50mm-bevel",
        name: "50mm Bevel Paving",
        description: "Durable and elegant paving solution for residential driveways, patios, and pedestrian walkways.",
        category: "Paving",
        categoryId: "paving",
        image: "/images/50mm.jpg",
        images: [],
        features: [
            "Non-slip surface",
            "Aesthetically pleasing bevel edge",
            "Easy maintenance",
            "Residential use",
        ],
        specs: [
            { label: "Size", value: "200 x 100 x 50mm" },
            { label: "Strength", value: "25 MPa" },
            { label: "Coverage", value: "50 blocks / m²" },
        ],
        usage: [
            "Residential driveways",
            "Patios",
            "Sidewalks and pedestrian zones",
        ],
        advantages: [
            { title: "Quality Standards Compliant", description: "Manufactured to strict national standards for abrasion and splitting strength." },
            { title: "Low Maintenance", description: "Durable concrete finish that requires minimal upkeep over decades." },
        ],
    },
    {
        id: "6",
        slug: "60mm-interlock",
        name: "60mm Interlock Paving",
        description: "Strong interlocking design ideal for medium-duty vehicular traffic, commercial parking lots, and industrial areas.",
        category: "Paving",
        categoryId: "paving",
        image: "/images/60mm.jpg",
        images: [],
        features: [
            "Interlocking design for increased stability",
            "High abrasion resistance",
            "Easy maintenance",
            "Medium-duty commercial use",
        ],
        specs: [
            { label: "Size", value: "200 x 100 x 60mm" },
            { label: "Strength", value: "30 MPa" },
            { label: "Coverage", value: "50 blocks / m²" },
        ],
        usage: [
            "Commercial parking areas",
            "Medium-duty access roads",
            "Pedestrian areas with occasional light vehicle traffic",
        ],
        advantages: [
            { title: "Quality Standards Compliant", description: "Manufactured to strict national standards for abrasion and splitting strength." },
            { title: "Low Maintenance", description: "Durable concrete finish that requires minimal upkeep over decades." },
        ],
    },
    {
        id: "7",
        slug: "80mm-interlock",
        name: "80mm Interlock Paving",
        description: "Heavy-duty interlocking paving designed for high-traffic industrial zones, loading docks, and heavy vehicular areas.",
        category: "Paving",
        categoryId: "paving",
        image: "/images/60mm.jpg",
        images: [],
        features: [
            "Deep interlocking structure for maximum strength",
            "Extreme abrasion resistance",
            "Withstands heavy loads",
            "Industrial grade",
        ],
        specs: [
            { label: "Size", value: "200 x 100 x 80mm" },
            { label: "Strength", value: "40 MPa" },
            { label: "Coverage", value: "50 blocks / m²" },
        ],
        usage: [
            "Industrial yards and loading docks",
            "Heavy-duty vehicular transit areas",
            "Fuel stations and weighbridges",
        ],
        advantages: [
            { title: "Quality Standards Compliant", description: "Manufactured to strict national standards for abrasion and splitting strength." },
            { title: "Low Maintenance", description: "Durable concrete finish that requires minimal upkeep over decades." },
        ],
    },
];

export interface Project {
    id: string;
    title: string;
    location: string;
    description: string;
    image: string;
    category: string;
}

export const projects: Project[] = [
    {
        id: "1",
        title: "Riverside Mall Expansion",
        location: "Nelspruit",
        description: "Supplied 15,000m² of Rib & Block slabs for the new retail wing. Delivered on schedule over a 6-month period.",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2689&auto=format&fit=crop",
        category: "Commercial",
    },
    {
        id: "2",
        title: "Lowveld Botanical Gardens Walkways",
        location: "Nelspruit",
        description: "Installation of 2000m² of bevel paving for visitor pathways, ensuring accessibility and durability.",
        image: "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=800&auto=format&fit=crop",
        category: "Civils",
    },
    {
        id: "3",
        title: "Luxury Estate Development",
        location: "White River",
        description: "Complete structural slab solution for 15 luxury residential units, including custom engineering.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        category: "Residential",
    },
    {
        id: "4",
        title: "N4 Highway Upgrade",
        location: "Mpumalanga",
        description: "Supply of high-strength concrete paving and structural components along the N4 route.",
        image: "https://images.unsplash.com/photo-1590644365607-1c5aef933181?q=80&w=2670&auto=format&fit=crop",
        category: "Infrastructure",
    },
];
