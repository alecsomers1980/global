// Product data for the shop
export interface PricingTier {
    quantity: 6 | 12 | 24 | 48;
    singlePrice: number;
    doublePrice: number;
}

export interface ProductVariant {
    name: string;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    size: string;
    price: number; // Base price (displayed as starting from)
    originalPrice?: number;
    discount?: number;
    image: string;
    features: string[];
    inStock: boolean;
    pricingTiers?: PricingTier[];
    variants?: ProductVariant[];
    artworkFee?: number;
}

export const productsList: Product[] = [
    // Billboards
    {
        id: 'billboards',
        name: 'Billboard Design, Print and Installation',
        category: 'billboards',
        description: 'Complete billboard manufacturing and installation service. Build an unmissable brand presence with our massive outdoor formats.\n\n*Excluding VAT\n*Includes installation on poles in & around JHB + PTA',
        size: 'Various Sizes',
        price: 10000,
        image: '/images/Billboards.jpg',
        features: [
            'Full structural engineering and manufacturing',
            'High-resolution outdoor PVC flighting',
            'Installation on poles included (JHB & PTA)',
            'Weatherproof and highly durable structure',
            'Maximum brand visibility'
        ],
        inStock: true,
        variants: [
            { name: '4x2m Billboard', price: 10000 },
            { name: '4x3m Billboard', price: 13000 },
            { name: '6x3m Billboard', price: 19000 },
            { name: '8x3m Billboard', price: 25000 }
        ]
    },
    // Estate Agent Boards
    {
        id: 'estate-board-small',
        name: 'Estate Agent Board - Small',
        category: 'estate-boards',
        description: 'Professional correx estate agent board. Perfect for residential properties. Weatherproof and durable.\n\nChoose between nationwide courier or local collection at checkout.',
        size: '600 x 400mm',
        price: 450,
        originalPrice: 3565,
        discount: 87,
        image: '/images/estate/600x400.jpg',
        features: [
            '5mm correx material',
            'Full color printing',
            'Weatherproof',
            'Lightweight and durable',
            'Easy to install'
        ],
        inStock: true,
        artworkFee: 250,
        pricingTiers: [
            // Cost is (unitPrice * qty)
            // 3mm Small SS: 55, DS: 100
            { quantity: 6, singlePrice: (55 * 6), doublePrice: (100 * 6) },
            { quantity: 12, singlePrice: (45 * 12), doublePrice: (80 * 12) },
            { quantity: 24, singlePrice: (40 * 24), doublePrice: (70 * 24) },
            { quantity: 48, singlePrice: (35 * 48), doublePrice: (60 * 48) }
        ]
    },
    {
        id: 'estate-board-medium',
        name: 'Estate Agent Board - Medium',
        category: 'estate-boards',
        description: 'Medium-sized estate agent board for maximum visibility. High-quality correx construction.\n\nChoose between nationwide courier or local collection at checkout.',
        size: '800 x 600mm',
        price: 950,
        originalPrice: 5190,
        discount: 85,
        image: '/images/estate/800x600.jpg',
        features: [
            '5mm correx material',
            'Full color printing',
            'Weatherproof',
            'Lightweight and durable',
            'Easy to install'
        ],
        inStock: true,
        artworkFee: 250,
        pricingTiers: [
            // Cost is (unitPrice * qty)
            // 3.5mm Medium SS: 135, DS: 200
            { quantity: 6, singlePrice: (135 * 6), doublePrice: (200 * 6) },
            { quantity: 12, singlePrice: (100 * 12), doublePrice: (150 * 12) },
            { quantity: 24, singlePrice: (95 * 24), doublePrice: (140 * 24) },
            { quantity: 48, singlePrice: (80 * 48), doublePrice: (120 * 48) }
        ]
    },
    {
        id: 'estate-board-large',
        name: 'Estate Agent Board - Large',
        category: 'estate-boards',
        description: 'Large estate agent board for commercial and luxury properties. Premium quality.\n\nChoose between nationwide courier or local collection at checkout.',
        size: '1200 x 800mm',
        price: 2130,
        originalPrice: 12710,
        discount: 87,
        image: '/images/estate/1200x800.jpg',
        features: [
            '5mm correx material',
            'Full color printing',
            'Weatherproof',
            'Lightweight and durable',
            'Easy to install'
        ],
        inStock: true,
        artworkFee: 250,
        pricingTiers: [
            // Cost is (unitPrice * qty)
            // 4.0mm Large SS: 280, DS: 420
            { quantity: 6, singlePrice: (280 * 6), doublePrice: (420 * 6) },
            { quantity: 12, singlePrice: (210 * 12), doublePrice: (320 * 12) },
            { quantity: 24, singlePrice: (190 * 24), doublePrice: (280 * 24) },
            { quantity: 48, singlePrice: (160 * 48), doublePrice: (240 * 48) }
        ]
    }
];

export const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'billboards', name: 'Billboards' },
    { id: 'estate-boards', name: 'Estate Agent Boards' },
    { id: 'safety-signs', name: 'Safety Signs' },
    { id: 'parking-signs', name: 'Parking Signs' },
    { id: 'property-signs', name: 'Property Signs' }
];

export function getProductById(id: string): Product | undefined {
    return productsList.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
    if (category === 'all') return productsList;
    return productsList.filter(p => p.category === category);
}

export function getLowestUnitPrice(product: Product): number | null {
    if (product.variants && product.variants.length > 0) {
        const variantPrices = product.variants.map(v => v.price);
        return Math.min(...variantPrices);
    }

    if (!product.pricingTiers || product.pricingTiers.length === 0) return null;

    // Calculate per-unit price for each tier (using single sided as it's the base price)
    // We want the lowest price per board
    const unitPrices = product.pricingTiers.map(tier => tier.singlePrice / tier.quantity);

    return Math.min(...unitPrices);
}


export const products = productsList;
export default productsList;

// End of file
