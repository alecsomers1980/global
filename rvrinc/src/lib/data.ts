import { PracticeArea, Attorney } from "@/types";

export const practiceAreas: PracticeArea[] = [
    {
        id: "1",
        title: "Civil Litigation",
        slug: "litigation",
        description: "Expert representation in High Court and Magistrate's Court disputes. We handle complex commercial litigation, contractual disputes, and delictual claims with precision and aggression when necessary.",
        icon: "Scale",
        features: [
            "High Court & Magistrate's Court Litigation",
            "Contractual Disputes",
            "Debt Collection",
            "Interdicts & Urgent Applications"
        ]
    },
    {
        id: "2",
        title: "Family Law",
        slug: "family",
        description: "Compassionate and discreet legal support for sensitive family matters. We prioritize the best interests of children and fair financial settlements in divorce proceedings.",
        icon: "Heart",
        features: [
            "Divorce Proceedings (Contested & Uncontested)",
            "Child Custody & Maintenance",
            "Antinuptial Contracts",
            "Protection Orders"
        ]
    },
    {
        id: "3",
        title: "Commercial Law",
        slug: "commercial",
        description: "Strategic legal advice for South African businesses. From company registration to complex mergers and compliance, we ensure your business is legally sound.",
        icon: "Briefcase",
        features: [
            "Company Registration & Structuring",
            "Shareholders Agreements",
            "Commercial Contracts",
            "Business Rescue & Insolvency"
        ]
    },
    {
        id: "4",
        title: "Property Law",
        slug: "property",
        description: "Comprehensive conveyancing and property law services. We assist with residential and commercial transfers, lease agreements, and eviction proceedings.",
        icon: "Home",
        features: [
            "Property Transfers (Conveyancing)",
            "Lease Agreements",
            "Eviction Orders (PIE Act)",
            "Sectional Title Disputes"
        ]
    },
    {
        id: "5",
        title: "Personal Injury",
        slug: "personal-injury",
        description: "Dedicated support for victims of negligence. We fight for maximum compensation in Road Accident Fund (RAF) claims and medical malpractice cases.",
        icon: "AlertCircle",
        features: [
            "Road Accident Fund (RAF) Claims",
            "Medical Negligence",
            "Public Liability Claims",
            "Dog Bite Claims"
        ]
    },
    {
        id: "6",
        title: "Criminal Law",
        slug: "criminal",
        description: "Defending your rights in criminal proceedings. Our experienced attorneys provide 24/7 bail support and expert trial defense.",
        icon: "Gavel",
        features: [
            "24/7 Bail Applications",
            "Criminal Trials",
            "Diversion Representations",
            "Expungement of Criminal Records"
        ]
    }
];

export const attorneys: Attorney[] = [
    {
        id: "1",
        slug: "marius-roets",
        name: "Marius Roets",
        role: "Senior Partner",
        bio: "Marius Roets is a founding partner with over 30 years of experience in Civil Litigation and Commercial Law. Known for his strategic approach in the High Court, he has successfully represented high-profile corporate clients and individuals alike.",
        qualifications: [
            "B.Proc (University of Pretoria)",
            "Admitted Attorney of the High Court (1990)",
            "Right of Appearance in High Court"
        ],
        specialties: ["Civil Litigation", "Commercial Law"],
        image: "/assets/team/marius-placeholder.jpg",
        email: "marius@rvrinc.co.za",
        is_partner: true
    },
    {
        id: "2",
        slug: "johan-van-rensburg",
        name: "Johan van Rensburg",
        role: "Partner",
        bio: "Johan specializes in Family Law and Property disputes. With a reputation for fair but firm negotiation, leads the firm's Family Law department.",
        qualifications: [
            "LLB (University of Stellenbosch)",
            "Admitted Attorney & Conveyancer (1995)"
        ],
        specialties: ["Family Law", "Property Law"],
        image: "/assets/team/johan-placeholder.jpg",
        email: "johan@rvrinc.co.za",
        is_partner: true
    },
    {
        id: "3",
        slug: "sarah-nkosi",
        name: "Sarah Nkosi",
        role: "Associate",
        bio: "Sarah is a rising star in Personal Injury and Labour Law. Her dedication to client justice has resulted in numerous successful RAF settlements.",
        qualifications: [
            "LLB (Wits University)",
            "Admitted Attorney (2020)"
        ],
        specialties: ["Personal Injury", "Labour Law"],
        image: "/assets/team/sarah-placeholder.jpg",
        email: "sarah@rvrinc.co.za",
        is_partner: false
    }
];
