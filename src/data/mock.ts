import type {
  AgentProfile,
  MonthlyProduction,
  Transaction,
  Goal,
  Achievement,
  Vendor,
  VendorCategory,
  Event,
  BrokerOpen,
  Notification,
  ToolDefinition,
  WealthBuilderContribution,
  WealthBuilderAccount,
} from '@/lib/types';
// A fixed, fictional snapshot keeps the demo reproducible; no production services.
export const SNAPSHOT = {
  date: '2026-09-21',
  label: 'September 21, 2026',
  year: 2026,
  elapsedMonths: 9,
};
export const photos = {
  house: '/images/house.jpg',
  house2: '/images/house2.jpg',
  house3: '/images/house3.jpg',
  interior: '/images/interior.jpg',
  event: '/images/event.jpg',
  vendor: '/images/vendor.jpg',
  avatar: '/images/avatar.jpg',
};
export const agent: AgentProfile = {
  id: 'agent-alexis',
  name: 'Alexis Oakes',
  email: 'agent@bluebase.demo',
  company: 'Coldwell Banker Select',
  office: 'South Tulsa',
  avatar: photos.avatar,
  phone: '(918) 555-0142',
  license: 'DEMO-184207',
  market: 'Tulsa metro',
  notifications: true,
};
const volumes = [
  420000, 580000, 750000, 860000, 940000, 1120000, 980000, 1295000, 1455000, 0, 0, 0,
];
const units = [1, 2, 2, 3, 3, 3, 3, 3, 4, 0, 0, 0];
export const monthly: MonthlyProduction[] = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'
  .split(' ')
  .map((month, i) => ({
    month,
    volume: volumes[i],
    prior: [
      340000, 410000, 610000, 650000, 820000, 880000, 930000, 1060000, 1020000, 890000, 750000,
      800000,
    ][i],
    units: units[i],
    gci: volumes[i] * 0.025,
    projected: i > 8,
  }));
export const goals: Goal[] = [
  { id: 'volume', label: 'Sales volume', target: 12000000, unit: 'currency' },
  { id: 'units', label: 'Closed units', target: 36, unit: 'number' },
  { id: 'gci', label: 'Gross commission', target: 300000, unit: 'currency' },
  { id: 'wealth', label: 'Wealth contributions', target: 24000, unit: 'currency' },
];
const addresses = [
  '1234 S Utica Ave',
  '9224 E 101st St',
  '3721 S Madison Ave',
  '4812 E 86th Place',
  '2810 S Florence Ave',
  '7108 S Oxford Ave',
  '1540 E 35th St',
  '6621 S Birmingham Ave',
  '4310 E 91st St',
  '8915 S Lakewood Ave',
  '3122 E 48th St',
  '9810 S Maplewood Ave',
  '1428 S Delaware Ave',
  '5570 E 76th St',
  '6012 S Louisville Ave',
  '2811 E 41st St',
  '10012 S Yale Ave',
  '8422 S Toledo Ave',
  '2109 S Lewis Ave',
  '4731 S Columbia Ave',
  '6801 E 58th St',
  '7620 S Canton Ave',
  '3415 E 67th St',
  '5108 S New Haven Ave',
];
// 24 closed sides reconcile exactly with the monthly series ($8.4M / 24 / $210k).
export const transactions: Transaction[] = monthly
  .filter((m) => !m.projected)
  .flatMap<Transaction>((m, mi) =>
    Array.from({ length: m.units }, (_, j) => {
      const index = units.slice(0, mi).reduce((a, b) => a + b, 0) + j;
      const price = Math.floor(m.volume / m.units) + (j === m.units - 1 ? m.volume % m.units : 0);
      return {
        id: `tx-${index}`,
        address: addresses[index],
        city: 'Tulsa, OK',
        price,
        date: `2026-${String(mi + 1).padStart(2, '0')}-${String(6 + j * 4).padStart(2, '0')}`,
        status: 'Closed' as const,
        side: index % 2 ? ('Buyer' as const) : ('Listing' as const),
        image: [photos.house, photos.house2, photos.house3][index % 3],
      };
    }),
  )
  .concat([
    {
      id: 'pending-1',
      address: '9224 E 101st St',
      city: 'Tulsa, OK',
      price: 445000,
      date: '2026-09-20',
      status: 'Pending',
      side: 'Buyer',
      image: photos.house2,
    },
    {
      id: 'pending-2',
      address: '8412 S Erie Ave',
      city: 'Tulsa, OK',
      price: 615000,
      date: '2026-09-19',
      status: 'Pending',
      side: 'Listing',
      image: photos.house,
    },
    {
      id: 'pending-3',
      address: '2115 E 32nd St',
      city: 'Tulsa, OK',
      price: 520000,
      date: '2026-09-18',
      status: 'Pending',
      side: 'Buyer',
      image: photos.house3,
    },
    {
      id: 'listing-1',
      address: '3721 S Madison Ave',
      city: 'Tulsa, OK',
      price: 729000,
      date: '2026-09-21',
      status: 'New listing',
      side: 'Listing',
      image: photos.interior,
    },
  ])
  .sort((a, b) => b.date.localeCompare(a.date));
export const achievements: Achievement[] = [
  {
    id: 'a1',
    title: '$5M club',
    description:
      'Five million in closed volume. A big milestone, built one relationship at a time.',
    tier: 'indigo',
    date: 'Jul 2026',
    unlocked: true,
  },
  {
    id: 'a2',
    title: 'Record month',
    description: 'September is your strongest month yet: $1.455M in closed volume.',
    tier: 'best',
    date: 'Sep 2026',
    unlocked: true,
  },
  {
    id: 'a3',
    title: 'Double end',
    description: 'Both sides of the table. One exceptional experience.',
    tier: 'teal',
    date: 'Jun 2026',
    unlocked: true,
  },
  {
    id: 'a4',
    title: '$10M club',
    description: 'Your next chapter. $1.6M in closed volume to go.',
    tier: 'apex',
    date: 'Next milestone',
    unlocked: false,
  },
  {
    id: 'a5',
    title: 'First closing',
    description: 'The first of many. Your first closing of the year.',
    tier: 'first',
    date: 'Jan 2026',
    unlocked: true,
  },
  {
    id: 'a6',
    title: '$1M YTD',
    description: 'Your first million of the year.',
    tier: 'sky',
    date: 'Feb 2026',
    unlocked: true,
  },
  {
    id: 'a7',
    title: 'Best sale',
    description: 'A $420,000 closing to start the year.',
    tier: 'best',
    date: 'Jan 2026',
    unlocked: true,
  },
  {
    id: 'a8',
    title: '$1M month',
    description: 'More than a million in June.',
    tier: 'sky',
    date: 'Jun 2026',
    unlocked: true,
  },
];
const vendorSeeds: [string, VendorCategory, string, string][] = [
  [
    'Ridgeline Roofing',
    'Roofing',
    'Tulsa metro',
    'Thoughtful inspections, honest estimates, and a crew that shows up.',
  ],
  [
    'Good Ground Inspections',
    'Home Inspectors',
    'Tulsa metro',
    'Clear reports that help your clients move forward with confidence.',
  ],
  [
    'Frame & Field',
    'Photography',
    'Tulsa metro',
    'Beautiful listing photography with a thoughtful editorial eye.',
  ],
  [
    'Airwell Comfort',
    'HVAC',
    'Broken Arrow',
    'Heating and cooling, from seasonal tune-ups to full installations.',
  ],
  [
    'Bluebird Plumbing',
    'Plumbing',
    'Tulsa metro',
    'Reliable repairs and quick answers when closing is on the line.',
  ],
  [
    'Current Electric',
    'Electrical',
    'Jenks / Bixby',
    'Licensed electricians who keep the details simple.',
  ],
  [
    'Fresh Start Co.',
    'Cleaning',
    'Tulsa metro',
    'Move-in-ready cleaning with every corner considered.',
  ],
  ['Careful Hands Moving', 'Moving', 'Broken Arrow', 'A smoother next chapter for your clients.'],
  [
    'Anchor Title Group',
    'Title / Closing',
    'Tulsa metro',
    'Responsive closing support from contract to keys.',
  ],
  ['Greenline Gardens', 'Landscaping', 'Jenks / Bixby', 'Curb appeal, thoughtfully cultivated.'],
  ['The Housewright', 'Handyman', 'Tulsa metro', 'The punch list partner you will call again.'],
  [
    'Stillwater Pools',
    'Pool',
    'Jenks / Bixby',
    'Pool care and inspections with clear communication.',
  ],
  [
    'Solid Earth Systems',
    'Foundation',
    'Tulsa metro',
    'Practical foundation assessments and repair plans.',
  ],
  [
    'Clear Creek Septic',
    'Septic',
    'Broken Arrow',
    'Thorough septic inspections for rural properties.',
  ],
  [
    'Prairie Home Inspections',
    'Home Inspectors',
    'Wichita metro',
    'A trusted second set of eyes for every home.',
  ],
  [
    'North Star Roofing',
    'Roofing',
    'Wichita metro',
    'Local expertise, from inspection through installation.',
  ],
  [
    'Open Door Media',
    'Photography',
    'Wichita metro',
    'Light-filled photography and property storytelling.',
  ],
  ['Neat & Neighborly', 'Cleaning', 'Broken Arrow', 'Detailed pre-listing and move-out cleaning.'],
];
export const vendors: Vendor[] = vendorSeeds.map(([name, category, area, description], i) => ({
  id: `v${i}`,
  name,
  category,
  area,
  description,
  rating: [4.9, 5, 4.8][i % 3],
  recommendations: 12 + i * 3,
  phone: `(918) 555-${String(100 + i).padStart(4, '0')}`,
  email: `hello@vendor${i}.example`,
  image: [photos.house, photos.interior, photos.house2, photos.vendor][i % 4],
  initials: name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join(''),
}));
export const categories = Array.from(new Set(vendors.map((v) => v.category)));
const listingSeeds = [
  '2810 S Florence Avenue',
  '1540 E 35th Street',
  '3122 S Rockford Avenue',
  '2109 S Lewis Avenue',
  '1428 E 41st Street',
  '4310 S Birmingham Avenue',
];
export const brokerOpens: BrokerOpen[] = [
  {
    id: 'e1',
    title: 'The Midtown collection',
    type: 'Broker open',
    date: '2026-09-22',
    time: '11:00 AM – 1:30 PM',
    location: 'Midtown Tulsa · 6 homes',
    area: 'Tulsa metro',
    description:
      'Six distinctive homes. One inspiring afternoon. Explore a curated Midtown route, meet the listing agents, and enjoy lunch along the way.',
    image: photos.house2,
    host: 'Alexis Oakes & Jordan Ellis',
    sponsor: 'Anchor Title Group · Lunch at stop 3',
    listings: listingSeeds.map((address, i) => ({
      id: `l${i}`,
      address,
      price: [615000, 729000, 485000, 895000, 565000, 1025000][i],
      agent: [
        'Alexis Oakes',
        'Jordan Ellis',
        'Morgan Reed',
        'Taylor Brooks',
        'Riley Chen',
        'Sam Parker',
      ][i],
      brokerage: i % 3 === 2 ? 'Independent demo brokerage' : 'Coldwell Banker Select',
      time: ['11:00', '11:25', '11:50', '12:15', '12:40', '1:05'][i] + ' ' + (i < 3 ? 'AM' : 'PM'),
      image: [photos.house, photos.house2, photos.house3, photos.interior][i % 4],
      beds: 3 + (i % 3),
      baths: 2 + (i % 2),
    })),
  },
  {
    id: 'e5',
    title: 'A morning in East Wichita',
    type: 'Broker open',
    date: '2026-09-29',
    time: '10:00 AM – 12:00 PM',
    location: 'East Wichita · 5 homes',
    area: 'Wichita metro',
    description:
      'Discover five new listings across East Wichita with local agents and coffee at the first stop.',
    image: photos.house3,
    host: 'Morgan Blake',
    sponsor: 'Prairie Closing Partners · Coffee & conversation',
    listings: listingSeeds.slice(0, 5).map((_, i) => ({
      id: `w${i}`,
      address: `${2100 + i * 120} N Prairie Lane`,
      price: 410000 + i * 45000,
      agent: ['Morgan Blake', 'Jamie Cole', 'Avery Fox', 'Casey Lane', 'Drew West'][i],
      brokerage: i === 3 ? 'Independent demo brokerage' : 'Coldwell Banker Plaza',
      time: `${10 + Math.floor(i / 3)}:${['00', '20', '40'][i % 3]} AM`,
      image: [photos.house3, photos.house2, photos.house][i % 3],
      beds: 3 + (i % 2),
      baths: 2,
    })),
  },
];
const eventSeeds: [string, Event['type'], string, string, string][] = [
  [
    'Your next listing, elevated',
    'Training',
    '2026-09-23',
    '10:00 – 11:00 AM',
    'Marketing studio · South Tulsa',
  ],
  [
    'Contracts with confidence',
    'CE class',
    '2026-09-24',
    '9:00 AM – 12:00 PM',
    'Learning center · Tulsa',
  ],
  ['Coffee & connection', 'Office event', '2026-09-25', '8:30 – 9:30 AM', 'South Tulsa office'],
  [
    'Fall community gathering',
    'Company event',
    '2026-10-01',
    '5:30 – 7:30 PM',
    'The Gathering Place · Tulsa',
  ],
  [
    'Building your referral business',
    'Training',
    '2026-10-05',
    '11:00 AM – 12:00 PM',
    'Online workshop',
  ],
  [
    'Fair housing essentials',
    'CE class',
    '2026-10-07',
    '9:00 AM – 12:00 PM',
    'Plaza learning center · Wichita',
  ],
  [
    'October office breakfast',
    'Office event',
    '2026-10-09',
    '8:30 – 9:30 AM',
    'Plaza office · Wichita',
  ],
  ['A smarter buyer consultation', 'Training', '2026-10-12', '10:00 – 11:00 AM', 'Online workshop'],
  ['Together, looking ahead', 'Company event', '2026-10-15', '4:00 – 6:00 PM', 'Downtown Tulsa'],
];
export const events: Event[] = [
  ...brokerOpens,
  ...eventSeeds.map(([title, type, date, time, location], i) => ({
    id: `event-${i}`,
    title,
    type,
    date,
    time,
    location,
    area: location.includes('Wichita') ? 'Wichita metro' : 'Tulsa metro',
    description: [
      'Practical ideas, shared experience, and time to ask questions. Join your colleagues for a fresh perspective on your business.',
      'Make room for a little connection. Meet fellow agents, exchange ideas, and leave with something useful.',
    ][i % 2],
    image: i % 2 ? photos.interior : photos.event,
    host: 'BlueBase learning & community team',
  })),
].sort((a, b) => a.date.localeCompare(b.date));
export const contributions: WealthBuilderContribution[] = transactions
  .filter((t) => t.status !== 'New listing')
  .map((t) => ({
    id: t.id,
    property: t.address,
    date: t.date,
    netCommission: t.price * 0.025,
    percent: 10,
    amount: t.price * 0.0025,
    status: t.status === 'Closed' ? 'Confirmed' : 'Pending',
  }));
export const wealth: WealthBuilderAccount = {
  balance: 68420,
  confirmed: 21000,
  pending: 3950,
  ytd: 21000,
  lifetime: 62100,
  history: monthly
    .filter((m) => !m.projected)
    .map((m, i) => ({
      month: m.month,
      balance: 47420 + monthly.slice(0, i + 1).reduce((s, x) => s + x.volume * 0.0025, 0),
    })),
};
export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Another closing, another milestone.',
    detail: 'Your latest closing has posted to your production profile.',
    time: '2 hours ago',
    href: '/production',
  },
  {
    id: 'n2',
    title: 'You’re 70% of the way there.',
    detail: '$8.4M toward your $12M annual volume goal.',
    time: '3 hours ago',
    href: '/production#goals',
  },
  {
    id: 'n3',
    title: 'Your next stop: Midtown.',
    detail: 'The Midtown collection broker open starts tomorrow at 11 AM.',
    time: 'Today',
    href: '/events',
  },
  {
    id: 'n4',
    title: 'A new name to know.',
    detail: 'Ridgeline Roofing joined the trusted vendor collection.',
    time: 'Yesterday',
    href: '/vendors',
  },
  {
    id: 'n5',
    title: 'Your future is growing.',
    detail: 'Your latest Wealth Builder contribution is confirmed.',
    time: 'Yesterday',
    href: '/wealth',
  },
];
export const tools: ToolDefinition[] = [
  {
    id: 'production',
    name: 'Production',
    description: 'The full picture of your business, and where you’re headed.',
    href: '/production',
    status: 'Available',
    icon: 'chart',
  },
  {
    id: 'wealth',
    name: 'Wealth Builder',
    description: 'Turn today’s work into tomorrow’s possibilities.',
    href: '/wealth',
    status: 'Available',
    icon: 'wealth',
  },
  {
    id: 'vendors',
    name: 'Vendor List',
    description: 'Good people to have in your corner.',
    href: '/vendors',
    status: 'Available',
    icon: 'vendor',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Make connections. Find your next opportunity.',
    href: '/events',
    status: 'Available',
    icon: 'event',
  },
  ...['Marketing', 'Training', 'Documents', 'Recognition', 'Closing Pipeline'].map((name, i) => ({
    id: `soon${i}`,
    name,
    description: [
      'Your brand, beautifully supported.',
      'Keep your curiosity working.',
      'Everything important, easy to find.',
      'Great work deserves a moment.',
      'A clearer path from contract to keys.',
    ][i],
    href: '',
    status: 'Coming soon' as const,
    icon: 'soon',
  })),
];
