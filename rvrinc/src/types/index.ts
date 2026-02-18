export type Role = 'client' | 'attorney' | 'admin' | 'staff';

export interface UserProfile {
    id: string;
    email: string;
    role: Role;
    full_name: string;
    avatar_url?: string;
    created_at: string;
}

export type CaseStatus = 'OPEN' | 'DISCOVERY' | 'LITIGATION' | 'CLOSED';

export interface Case {
    id: string;
    case_number: string;
    client_id: string;
    assigned_attorney_id: string;
    status: CaseStatus;
    title: string;
    description: string;
    timeline: TimelineEvent[];
    created_at: string;
    updated_at: string;
}

export interface TimelineEvent {
    step: string;
    completed: boolean;
    date?: string;
    notes?: string;
}

export interface Attorney {
    id: string;
    slug: string;
    name: string;
    role: string;
    bio: string;
    qualifications: string[];
    specialties: string[];
    image: string;
    email: string;
    linkedin?: string;
    is_partner: boolean;
}

export interface PracticeArea {
    id: string;
    title: string;
    slug: string;
    description: string;
    icon: string;
    features: string[];
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    published_date: string;
    author: string;
    category: string;
    image?: string;
}
