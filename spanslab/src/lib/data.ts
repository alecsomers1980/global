export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    categoryId: "rib-and-block" | "paving" | "ready-mix" | "building-materials";
    image: string;
    images: string[];
    features: string[];
    specs: { label: string; value: string }[];
}

export const products: Product[] = [
    {
        id: "1",
        slug: "rib-and-block-150mm",
        name: "150mm Rib & Block System",
        description: "Our standard 150mm Rib and Block slab system is ideal for residential first-floor slabs. Lightweight, cost-effective, and easy to install without heavy lifting equipment.",
        category: "Rib & Block",
        categoryId: "rib-and-block",
        image: "https://images.unsplash.com/photo-1590486803833-1c5c65d56d3a?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1590486803833-1c5c65d56d3a?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
        ],
        features: [
            "Reduced concrete consumption",
            "No crane required for installation",
            "Excellent thermal and sound insulation",
            "SABS approved materials",
        ],
        specs: [
            { label: "Block Height", value: "150mm" },
            { label: "Overall Slab Depth", value: "200mm" },
            { label: "Concrete Volume", value: "0.08 m³/m²" },
            { label: "Self Weight", value: "265 kg/m²" },
        ],
    },
    {
        id: "2",
        slug: "rib-and-block-200mm",
        name: "200mm Rib & Block System",
        description: "Heavy-duty 200mm system designed for commercial applications and wider spans. Provides superior load-bearing capacity while maintaining ease of installation.",
        category: "Rib & Block",
        categoryId: "rib-and-block",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
        images: [],
        features: ["High load capacity", "Suitable for commercial builds", "Fire resistant"],
        specs: [
            { label: "Block Height", value: "200mm" },
            { label: "Overall Slab Depth", value: "250mm" },
        ],
    },
    {
        id: "3",
        slug: "bevel-paver-50mm",
        name: "50mm Bevel Paver - Grey",
        description: "Standard industrial grey bevel pavers for residential driveways, walkways, and patios. Durable concrete construction with non-slip finish.",
        category: "Paving",
        categoryId: "paving",
        image: "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=800&auto=format&fit=crop",
        images: [],
        features: ["Interlocking design", "Cost-effective", "Low maintenance"],
        specs: [
            { label: "Dimensions", value: "200 x 100 x 50mm" },
            { label: "Coverage", value: "50 units/m²" },
            { label: "Strength", value: "25 MPa" },
        ],
    },
    {
        id: "4",
        slug: "interlock-paver-60mm",
        name: "60mm Interlock Paver - Charcoal",
        description: "Heavy-duty 60mm interlocking pavers ideal for industrial yards, parking areas, and petrol stations. Designed to withstand vehicular traffic.",
        category: "Paving",
        categoryId: "paving",
        image: "https://images.unsplash.com/photo-1533628469279-d576a928baeb?q=80&w=800&auto=format&fit=crop",
        images: [],
        features: ["High load bearing", "Geometric lock", "Modern charcoal finish"],
        specs: [
            { label: "Thickness", value: "60mm" },
            { label: "Strength", value: "35 MPa" },
        ],
    },
    {
        id: "5",
        slug: "ready-mix-25mpa",
        name: "25 MPa Standard Concrete",
        description: "General purpose ready-mix concrete suitable for house foundations, surface beds, and sturdy footpaths.",
        category: "Ready Mix",
        categoryId: "ready-mix",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
        images: [],
        features: ["Consistent quality mix", "Delivered to site", "Workable slump"],
        specs: [
            { label: "Strength", value: "25 MPa at 28 days" },
            { label: "Stone Size", value: "19mm" },
        ],
    },
    {
        id: "6",
        slug: "plaster-sand",
        name: "Plaster Sand (Bulk)",
        description: "Clean, washed pit sand ideal for plastering and mortar mixes. Available in 10m³ loads.",
        category: "Building Materials",
        categoryId: "building-materials",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
        images: [],
        features: ["Double washed", "Fine grain", "Organic free"],
        specs: [
            { label: "Unit", value: "Cubic Meter / Ton" },
            { label: "Application", value: "Plaster, Mortar" },
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
        description: "Supply of 30MPa Ready Mix concrete for drainage channels and culverts along the N4 route.",
        image: "https://images.unsplash.com/photo-1590644365607-1c5aef933181?q=80&w=2670&auto=format&fit=crop",
        category: "Infrastructure",
    },
];
