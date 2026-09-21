export interface Agent {
  id: string;
  name: string;
  email: string;
  company: string;
  office: string;
  avatar: string;
}
export interface AgentProfile extends Agent {
  phone: string;
  license: string;
  market: string;
  notifications: boolean;
}
export interface MonthlyProduction {
  month: string;
  volume: number;
  prior: number;
  units: number;
  gci: number;
  projected?: boolean;
}
export interface ProductionSummary {
  volume: number;
  units: number;
  gci: number;
  average: number;
  pendingVolume: number;
  pendingUnits: number;
  listings: number;
  buyerSides: number;
  listingSides: number;
  priorVolume: number;
}
export interface Transaction {
  id: string;
  address: string;
  city: string;
  price: number;
  date: string;
  status: 'Closed' | 'Pending' | 'New listing';
  side: 'Buyer' | 'Listing';
  image: string;
}
export interface Goal {
  id: 'volume' | 'units' | 'gci' | 'wealth';
  label: string;
  target: number;
  unit: 'currency' | 'number';
}
export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: 'first' | 'sky' | 'indigo' | 'apex' | 'best' | 'teal';
  date: string;
  unlocked: boolean;
}
export interface WealthBuilderAccount {
  balance: number;
  confirmed: number;
  pending: number;
  ytd: number;
  lifetime: number;
  history: { month: string; balance: number }[];
}
export interface WealthBuilderContribution {
  id: string;
  property: string;
  date: string;
  netCommission: number;
  percent: number;
  amount: number;
  status: 'Confirmed' | 'Pending';
}
export type VendorCategory =
  | 'Home Inspectors'
  | 'Roofing'
  | 'HVAC'
  | 'Plumbing'
  | 'Electrical'
  | 'Photography'
  | 'Cleaning'
  | 'Moving'
  | 'Title / Closing'
  | 'Landscaping'
  | 'Handyman'
  | 'Pool'
  | 'Foundation'
  | 'Septic';
export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  area: string;
  rating: number;
  recommendations: number;
  description: string;
  phone: string;
  email: string;
  image: string;
  initials: string;
}
export type EventType = 'Company event' | 'Training' | 'CE class' | 'Office event' | 'Broker open';
export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  area: string;
  description: string;
  image: string;
  host: string;
}
export interface BrokerOpenListing {
  id: string;
  address: string;
  price: number;
  agent: string;
  brokerage: string;
  time: string;
  image: string;
  beds: number;
  baths: number;
}
export interface BrokerOpen extends Event {
  type: 'Broker open';
  sponsor: string;
  listings: BrokerOpenListing[];
}
export interface Notification {
  id: string;
  title: string;
  detail: string;
  time: string;
  href: string;
}
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  href: string;
  status: 'Available' | 'Coming soon';
  icon: string;
}
