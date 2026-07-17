// ── Curated Welcome Packages ──────────────────────────────────────────────
// A standard catalog of arrival packages shown on /student/welcome. Each tier
// bundles a DIFFERENT set of services at a different price. Host-created
// packages from the DB are shown alongside these.
//
// These render on both the list page and the detail page (looked up by `id`),
// so the ids double as URL slugs — keep them stable & unique.

export type WelcomePackage = {
  id: string;
  tier: 'basic' | 'standard' | 'premium' | 'custom';
  title: string;
  price: number;
  community: string;            // 'Any' for the standard catalog
  description: string;
  notes?: string;
  curated: true;                // marks it as a built-in (no real host row)
  host_id: null;
  users: { full_name: string } | null;
  // services
  airport_pickup: boolean;
  airport_served: string;
  nights_stay: number;
  meals_included: number;
  dropoff_included: boolean;
  grocery_run: boolean;
  campus_tour: boolean;
  sim_card_help: boolean;
  bank_account_help: boolean;
  housing_hunt_help: boolean;
};

export const DEFAULT_WELCOME_PACKAGES: WelcomePackage[] = [
  {
    id: 'arrival-essentials',
    tier: 'basic',
    title: 'Arrival Essentials',
    price: 45,
    community: 'Any',
    description: 'Just landed? Get picked up at the airport and dropped right at your door — the essentials for a stress-free arrival.',
    curated: true,
    host_id: null,
    users: { full_name: 'Handout Hosts' },
    airport_pickup: true,
    airport_served: 'PHL',
    nights_stay: 0,
    meals_included: 0,
    dropoff_included: true,
    grocery_run: false,
    campus_tour: false,
    sim_card_help: false,
    bank_account_help: false,
    housing_hunt_help: false,
  },
  {
    id: 'settle-in',
    tier: 'standard',
    title: 'Settle-In',
    price: 120,
    community: 'Any',
    description: 'Land, rest, and get set up. Two nights with a verified host, home-cooked meals, and help getting your US SIM sorted.',
    curated: true,
    host_id: null,
    users: { full_name: 'Handout Hosts' },
    airport_pickup: true,
    airport_served: 'PHL / EWR',
    nights_stay: 2,
    meals_included: 4,
    dropoff_included: true,
    grocery_run: false,
    campus_tour: false,
    sim_card_help: true,
    bank_account_help: false,
    housing_hunt_help: false,
  },
  {
    id: 'full-landing',
    tier: 'premium',
    title: 'Full Landing',
    price: 210,
    community: 'Any',
    description: 'The complete first-week experience — accommodation, home-cooked meals, a grocery run, a campus tour, plus SIM and bank setup help.',
    curated: true,
    host_id: null,
    users: { full_name: 'Handout Hosts' },
    airport_pickup: true,
    airport_served: 'Any — PHL / EWR / JFK',
    nights_stay: 4,
    meals_included: 10,
    dropoff_included: true,
    grocery_run: true,
    campus_tour: true,
    sim_card_help: true,
    bank_account_help: true,
    housing_hunt_help: false,
  },
  {
    id: 'concierge',
    tier: 'custom',
    title: 'Concierge',
    price: 349,
    community: 'Any',
    description: 'White-glove, fully personalized support for your move to the USA — every service included, tailored to your flight, budget, and needs.',
    notes: 'Fully tailored. Add or remove anything — your host builds the plan around your exact arrival. Great for families or students who want zero hassle.',
    curated: true,
    host_id: null,
    users: { full_name: 'Handout Hosts' },
    airport_pickup: true,
    airport_served: 'Any airport',
    nights_stay: 6,
    meals_included: 14,
    dropoff_included: true,
    grocery_run: true,
    campus_tour: true,
    sim_card_help: true,
    bank_account_help: true,
    housing_hunt_help: true,
  },
];

export function getDefaultPackage(id: string): WelcomePackage | undefined {
  return DEFAULT_WELCOME_PACKAGES.find(p => p.id === id);
}
