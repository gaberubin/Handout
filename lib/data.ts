// ─── TYPES ───────────────────────────────────────────────────────────────────

export type AvatarColor = 'amber' | 'blue' | 'green' | 'rose' | 'violet' | 'teal' | 'navy';

export interface Roommate {
  id: string;
  initials: string;
  color: AvatarColor;
  name: string;
  university: string;
  major: string;
  compatibility: number;
  budget: string;
  moveIn: string;
  location: string;
  tags: string[];
}

export interface FoodProvider {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  rating: number;
  reviews: number;
  cuisine: string;
  diet: string;
  distance: string;
  tags: string[];
  pricePerMeal: number;
  pricePerMonth: number;
  verified: boolean;
}

export interface ServiceProvider {
  id: string;
  initials: string;
  color: AvatarColor;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  rate: string;
  tags: string[];
  verified: boolean;
  badge?: string;
}

export interface Booking {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  name: string;
  date: string;
  time: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  price: number;
}

export interface Message {
  id: string;
  initials: string;
  color: AvatarColor;
  name: string;
  role?: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

// ─── ROOMMATES ───────────────────────────────────────────────────────────────

export const roommates: Roommate[] = [
  {
    id: 'rm1',
    initials: 'SM',
    color: 'blue',
    name: 'Sonal M.',
    university: 'UIC',
    major: 'Computer Science',
    compatibility: 94,
    budget: '$700–900 / month',
    moveIn: 'June 2025',
    location: 'Near UIC campus',
    tags: ['Vegetarian', 'Early riser', 'Non-smoker'],
  },
  {
    id: 'rm2',
    initials: 'LN',
    color: 'rose',
    name: 'Lin N.',
    university: 'DePaul',
    major: 'Business',
    compatibility: 88,
    budget: '$600–850 / month',
    moveIn: 'Aug 2025',
    location: 'Lincoln Park area',
    tags: ['Night owl', 'International', 'Non-smoker'],
  },
  {
    id: 'rm3',
    initials: 'AP',
    color: 'green',
    name: 'Aarav P.',
    university: 'Northwestern',
    major: 'Engineering',
    compatibility: 82,
    budget: '$800–1000 / month',
    moveIn: 'Jul 2025',
    location: 'Evanston preferred',
    tags: ['Vegetarian', 'Early riser', 'International'],
  },
  {
    id: 'rm4',
    initials: 'JK',
    color: 'violet',
    name: 'Jordan K.',
    university: 'Loyola',
    major: 'Pre-Med',
    compatibility: 79,
    budget: '$650–900 / month',
    moveIn: 'Sep 2025',
    location: 'Rogers Park',
    tags: ['Non-smoker', 'Quiet study', 'Pet-friendly'],
  },
  {
    id: 'rm5',
    initials: 'MS',
    color: 'teal',
    name: 'Maya S.',
    university: 'IIT Chicago',
    major: 'Architecture',
    compatibility: 76,
    budget: '$750–950 / month',
    moveIn: 'Aug 2025',
    location: 'Bridgeport area',
    tags: ['Early riser', 'Non-smoker', 'Vegetarian'],
  },
  {
    id: 'rm6',
    initials: 'RC',
    color: 'amber',
    name: 'Ravi C.',
    university: 'UChicago',
    major: 'Economics',
    compatibility: 71,
    budget: '$900–1200 / month',
    moveIn: 'Oct 2025',
    location: 'Hyde Park area',
    tags: ['Night owl', 'Vegetarian', 'International'],
  },
];

// ─── FOOD PROVIDERS ──────────────────────────────────────────────────────────

export const foodProviders: FoodProvider[] = [
  {
    id: 'fp1',
    name: "Anaya's Kitchen",
    emoji: '🍛',
    bgColor: '#E7F1EA',
    rating: 4.9,
    reviews: 128,
    cuisine: 'Indian',
    diet: 'Vegetarian',
    distance: '2.1mi',
    tags: ['Mon–Fri delivery', 'Homestyle'],
    pricePerMeal: 8,
    pricePerMonth: 140,
    verified: true,
  },
  {
    id: 'fp2',
    name: "Uncle Chen's",
    emoji: '🍜',
    bgColor: '#E7F1EA',
    rating: 4.7,
    reviews: 91,
    cuisine: 'Chinese',
    diet: 'Non-veg',
    distance: '1.4mi',
    tags: ['Daily delivery', 'Noodles & Rice'],
    pricePerMeal: 9,
    pricePerMonth: 160,
    verified: true,
  },
  {
    id: 'fp3',
    name: "Fatima's Tiffin",
    emoji: '🥘',
    bgColor: '#FFF7ED',
    rating: 4.8,
    reviews: 63,
    cuisine: 'Pakistani',
    diet: 'Halal',
    distance: '0.9mi',
    tags: ['Halal', 'Daily 7 days'],
    pricePerMeal: 10,
    pricePerMonth: 175,
    verified: true,
  },
  {
    id: 'fp4',
    name: "Grandma Rosa's",
    emoji: '🫕',
    bgColor: '#FFF1F2',
    rating: 4.6,
    reviews: 45,
    cuisine: 'Mexican',
    diet: 'Non-veg',
    distance: '3.2mi',
    tags: ['Weekend special', 'Family recipes'],
    pricePerMeal: 7,
    pricePerMonth: 120,
    verified: false,
  },
  {
    id: 'fp5',
    name: "Preet's Dabbawala",
    emoji: '🍱',
    bgColor: '#F0F9FF',
    rating: 4.5,
    reviews: 38,
    cuisine: 'Punjabi',
    diet: 'Vegetarian',
    distance: '1.8mi',
    tags: ['Weekly plans', 'Vegan option'],
    pricePerMeal: 8,
    pricePerMonth: 145,
    verified: true,
  },
  {
    id: 'fp6',
    name: "Seoul Bowl",
    emoji: '🍚',
    bgColor: '#F5F3FF',
    rating: 4.4,
    reviews: 29,
    cuisine: 'Korean',
    diet: 'Non-veg',
    distance: '2.5mi',
    tags: ['Mon–Sat', 'K-BBQ'],
    pricePerMeal: 11,
    pricePerMonth: 190,
    verified: false,
  },
];

// ─── SERVICE PROVIDERS ───────────────────────────────────────────────────────

export const serviceProviders: ServiceProvider[] = [
  {
    id: 'sp1',
    initials: 'RJ',
    color: 'teal',
    name: 'Raj Johar',
    role: 'Airport Pickup & Drop',
    rating: 4.9,
    reviews: 214,
    rate: '$35 / trip',
    tags: ['Licensed driver', 'All airports', '24/7'],
    verified: true,
    badge: 'Top Rated',
  },
  {
    id: 'sp2',
    initials: 'SK',
    color: 'rose',
    name: 'Sarah Kim',
    role: 'Babysitter & Nanny',
    rating: 4.8,
    reviews: 87,
    rate: '$18 / hr',
    tags: ['CPR certified', 'Ages 0–12', 'Background checked'],
    verified: true,
  },
  {
    id: 'sp3',
    initials: 'MT',
    color: 'blue',
    name: 'Mike T.',
    role: 'Handyman & Repairs',
    rating: 4.7,
    reviews: 156,
    rate: '$45 / hr',
    tags: ['Plumbing', 'Electrical', 'Furniture'],
    verified: true,
  },
  {
    id: 'sp4',
    initials: 'AN',
    color: 'violet',
    name: 'Anika N.',
    role: 'Tutoring — Math & Science',
    rating: 4.9,
    reviews: 62,
    rate: '$30 / hr',
    tags: ['GRE prep', 'Calculus', 'Physics'],
    verified: true,
    badge: 'Top Rated',
  },
  {
    id: 'sp5',
    initials: 'LC',
    color: 'green',
    name: 'Luis C.',
    role: 'Moving & Relocation',
    rating: 4.6,
    reviews: 43,
    rate: '$60 / hr',
    tags: ['Furniture', 'Same-day', 'Licensed'],
    verified: false,
  },
  {
    id: 'sp6',
    initials: 'PP',
    color: 'amber',
    name: 'Priya P.',
    role: 'Personal Chef',
    rating: 4.8,
    reviews: 31,
    rate: '$55 / session',
    tags: ['Veg & Non-veg', 'Meal prep', 'Dietary needs'],
    verified: true,
  },
];

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

export const bookings: Booking[] = [
  {
    id: 'bk1',
    icon: '✈️',
    iconColor: '#12A150',
    iconBg: '#E7F1EA',
    name: "Airport Pickup — O'Hare ORD",
    date: 'May 18',
    time: '3:45 PM',
    provider: 'Raj Johar',
    status: 'confirmed',
    price: 45,
  },
  {
    id: 'bk2',
    icon: '❤️',
    iconColor: '#E11D48',
    iconBg: '#FDF2F8',
    name: 'Babysitting — 3 hours',
    date: 'May 20',
    time: '5:00 PM',
    provider: 'Sarah Kim',
    status: 'confirmed',
    price: 54,
  },
  {
    id: 'bk3',
    icon: '🔧',
    iconColor: '#12A150',
    iconBg: '#E7F1EA',
    name: 'Handyman — Furniture Assembly',
    date: 'May 10',
    time: '11:00 AM',
    provider: 'Mike T.',
    status: 'completed',
    price: 90,
  },
  {
    id: 'bk4',
    icon: '📚',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    name: 'Math Tutoring — 2 hours',
    date: 'May 8',
    time: '4:00 PM',
    provider: 'Anika N.',
    status: 'completed',
    price: 60,
  },
  {
    id: 'bk5',
    icon: '🍱',
    iconColor: '#12A150',
    iconBg: '#E7F1EA',
    name: 'Food Subscription — May',
    date: 'May 1',
    time: 'Monthly',
    provider: "Anaya's Kitchen",
    status: 'confirmed',
    price: 140,
  },
  {
    id: 'bk6',
    icon: '🚚',
    iconColor: '#64748B',
    iconBg: '#F1F5F9',
    name: 'Moving Help — 3 rooms',
    date: 'Jun 1',
    time: '9:00 AM',
    provider: 'Luis C.',
    status: 'pending',
    price: 180,
  },
];

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export const messages: Message[] = [
  {
    id: 'msg1',
    initials: 'PM',
    color: 'blue',
    name: 'Priya M.',
    role: 'Roommate',
    preview: 'Hey! Are you still looking for a 2BR near campus?',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'msg2',
    initials: 'AK',
    color: 'amber',
    name: "Anaya's Kitchen",
    preview: 'Monday delivery confirmed for 12:30 PM',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'msg3',
    initials: 'RJ',
    color: 'teal',
    name: 'Raj (Driver)',
    preview: "I'll be at Terminal 3 in a blue Camry",
    time: '3h ago',
    unread: false,
  },
  {
    id: 'msg4',
    initials: 'SK',
    color: 'rose',
    name: 'Sarah Kim',
    role: 'Babysitter',
    preview: 'Happy to confirm for Tuesday at 5PM!',
    time: '1d ago',
    unread: false,
  },
  {
    id: 'msg5',
    initials: 'AP',
    color: 'green',
    name: 'Aarav P.',
    role: 'Roommate',
    preview: 'Just saw your profile — we seem like a great match!',
    time: '2d ago',
    unread: false,
  },
];

// ─── MEMBERSHIP PLANS ────────────────────────────────────────────────────────

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started and find your footing.',
    features: [
      '5 roommate matches / month',
      'Browse food providers',
      'Browse service listings',
      '3 messages / day',
      'Basic community access',
    ],
    cta: 'Current plan',
    highlighted: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 9,
    period: 'month',
    description: 'The full Handout experience for serious students.',
    features: [
      'Unlimited roommate matches',
      'Priority booking',
      'Unlimited messages',
      'Full community features',
      'Verified badge on profile',
      'Advanced filters & search',
    ],
    cta: 'Upgrade to Plus',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    description: 'For power users and student group coordinators.',
    features: [
      'Everything in Plus',
      'Group housing coordination',
      'Bulk food order discounts',
      'Dedicated support',
      'Early access to features',
      'Analytics dashboard',
    ],
    cta: 'Upgrade to Pro',
    highlighted: false,
  },
];

// ─── PROVIDER STATS ──────────────────────────────────────────────────────────

export const providerStats = {
  earningsThisMonth: 1240,
  earningsChange: '+18%',
  completedJobs: 23,
  jobsChange: '+5 this month',
  avgRating: 4.9,
  ratingCount: 214,
  responseRate: '98%',
  responseLabel: 'Response rate',
};

export const providerEarnings = [
  { month: 'Jan', amount: 820 },
  { month: 'Feb', amount: 940 },
  { month: 'Mar', amount: 1100 },
  { month: 'Apr', amount: 1050 },
  { month: 'May', amount: 1240 },
  { month: 'Jun', amount: 0 },
];

// ─── ADMIN STATS ─────────────────────────────────────────────────────────────

export const adminStats = {
  totalStudents: 4821,
  studentsGrowth: '+12% this month',
  activeProviders: 342,
  providersGrowth: '+8 this week',
  monthlyBookings: 1893,
  bookingsGrowth: '+23% vs last month',
  platformRevenue: 28400,
  revenueGrowth: '+31% this month',
};

export const adminGrowthData = [
  { month: 'Jan', students: 2800, providers: 180 },
  { month: 'Feb', students: 3100, providers: 210 },
  { month: 'Mar', students: 3500, providers: 250 },
  { month: 'Apr', students: 4100, providers: 300 },
  { month: 'May', students: 4821, providers: 342 },
];

export const recentUsers = [
  { id: 'u1', initials: 'AK', color: 'amber' as AvatarColor, name: 'Arjun Kumar', email: 'arjun@uic.edu', role: 'Student', plan: 'Free', joined: '2h ago', status: 'active' },
  { id: 'u2', initials: 'PM', color: 'blue' as AvatarColor, name: 'Priya Mehta', email: 'priya@depaul.edu', role: 'Student', plan: 'Plus', joined: '5h ago', status: 'active' },
  { id: 'u3', initials: 'RJ', color: 'teal' as AvatarColor, name: 'Raj Johar', email: 'raj@handout.app', role: 'Provider', plan: 'Free', joined: '1d ago', status: 'active' },
  { id: 'u4', initials: 'LN', color: 'rose' as AvatarColor, name: 'Lin Nguyen', email: 'lin@northwestern.edu', role: 'Student', plan: 'Pro', joined: '2d ago', status: 'active' },
  { id: 'u5', initials: 'MT', color: 'navy' as AvatarColor, name: 'Mike Torres', email: 'mike@handout.app', role: 'Provider', plan: 'Free', joined: '3d ago', status: 'pending' },
];
