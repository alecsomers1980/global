import { PracticeArea, Attorney } from "@/types";

export const practiceAreas: PracticeArea[] = [
    {
        id: "1",
        title: "Pedestrian & Passenger Claims",
        slug: "pedestrian-passenger",
        description: "Whether you were struck as a pedestrian or injured as a passenger, you have a right to claim from the Road Accident Fund. We handle the full process — from lodgement to payment.",
        icon: "Car",
        features: [
            "Pedestrian Accident Claims",
            "Passenger Injury Claims",
            "Full RAF Lodgement Process",
            "No Upfront Cost"
        ]
    },
    {
        id: "2",
        title: "Serious Injury Assessment",
        slug: "serious-injury",
        description: "If your injuries qualify under the serious injury threshold, you may claim general damages. We guide you through the HPCSA assessment and fight for the compensation you deserve.",
        icon: "UserRound",
        features: [
            "HPCSA Serious Injury Assessment",
            "General Damages Claims",
            "Independent Medical Evaluations",
            "Maximum Compensation Strategy"
        ]
    },
    {
        id: "3",
        title: "Loss of Earnings & Support",
        slug: "loss-of-earnings",
        description: "An accident that prevents you from working — or that took your breadwinner — carries a quantifiable financial loss. We build a proper actuarial claim to recover past and future income.",
        icon: "TrendingUp",
        features: [
            "Past & Future Loss of Earnings",
            "Actuarial Calculations",
            "Loss of Support Claims",
            "Breadwinner Dependency Claims"
        ]
    },
    {
        id: "4",
        title: "Medical Expenses",
        slug: "medical-expenses",
        description: "Past hospital bills, specialist visits, rehabilitation, and future medical costs can all form part of your RAF claim. We ensure nothing is left out of your schedule of damages.",
        icon: "Stethoscope",
        features: [
            "Past Medical Expenses",
            "Future Medical Costs",
            "Rehabilitation Costs",
            "Schedule of Damages Preparation"
        ]
    },
    {
        id: "5",
        title: "Dependants & Wrongful Death",
        slug: "wrongful-death",
        description: "If a family member was killed in a road accident, dependants may claim for loss of support. We handle funeral costs, dependency calculations, and the full RAF process on your behalf.",
        icon: "Users",
        features: [
            "Loss of Support Claims",
            "Funeral Cost Claims",
            "Dependency Calculations",
            "Full RAF Claim Management"
        ]
    },
    {
        id: "6",
        title: "Prescription & Late Claims",
        slug: "prescription",
        description: "RAF claims prescribe three years from the accident date — missing this deadline can bar your claim entirely. Contact us immediately; in some circumstances late claims can still be saved.",
        icon: "Clock",
        features: [
            "3-Year Prescription Deadlines",
            "Late Claim Assessments",
            "Urgent Deadline Reviews",
            "Settlement Negotiation"
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
