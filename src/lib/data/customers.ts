// Mock customer data for STIGMATOR admin
export type CustomerRole = "CUSTOMER" | "ARTIST" | "ADMIN" | "SUPER_ADMIN" | "DEVELOPER";
export type CustomerStatus = "active" | "inactive" | "suspended" | "pending";

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  role: CustomerRole;
  status: CustomerStatus;
  avatar: string | null;
  joinedAt: string;
  lastActive: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  phone?: string;
  location?: string;
  bio?: string;
  orders?: CustomerOrder[];
  activityLog?: ActivityItem[];
}

export interface CustomerOrder {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "processing" | "pending" | "shipped" | "cancelled";
  items: number;
}

export interface ActivityItem {
  id: string;
  type: "login" | "order" | "profile_update" | "role_change" | "status_change" | "email_sent";
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Generate avatar URL
const getAvatar = (name: string) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4ade80&color=000&size=128`;
};

// Mock customers data
export const mockCustomers: Customer[] = [
  {
    id: "usr_001",
    email: "sarah.chen@example.com",
    fullName: "Sarah Chen",
    displayName: "Sarah Chen",
    role: "CUSTOMER",
    status: "active",
    avatar: null,
    joinedAt: "2024-01-15T08:30:00Z",
    lastActive: "2025-03-22T14:20:00Z",
    totalOrders: 12,
    totalSpent: 1847.50,
    avgOrderValue: 153.96,
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Tattoo enthusiast and digital artist",
    orders: [
      { id: "ORD-7829", date: "2025-04-08", amount: 129.99, status: "completed", items: 2 },
      { id: "ORD-7712", date: "2025-03-15", amount: 245.00, status: "completed", items: 3 },
      { id: "ORD-7654", date: "2025-02-28", amount: 89.50, status: "completed", items: 1 },
    ],
    activityLog: [
      { id: "act_001", type: "login", description: "Logged in from Chrome on macOS", timestamp: "2025-03-22T14:20:00Z" },
      { id: "act_002", type: "order", description: "Placed order #ORD-7829", timestamp: "2025-04-08T10:15:00Z" },
      { id: "act_003", type: "profile_update", description: "Updated profile picture", timestamp: "2025-03-10T16:45:00Z" },
    ],
  },
  {
    id: "usr_002",
    email: "marcus.johnson@example.com",
    fullName: "Marcus Johnson",
    displayName: "Marcus J",
    role: "ARTIST",
    status: "active",
    avatar: null,
    joinedAt: "2023-08-22T14:15:00Z",
    lastActive: "2025-03-23T09:10:00Z",
    totalOrders: 8,
    totalSpent: 1245.00,
    avgOrderValue: 155.63,
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    bio: "Professional tattoo artist specializing in geometric designs",
    orders: [
      { id: "ORD-7827", date: "2025-04-07", amount: 245.00, status: "pending", items: 3 },
      { id: "ORD-7590", date: "2025-03-01", amount: 189.99, status: "completed", items: 2 },
    ],
    activityLog: [
      { id: "act_004", type: "login", description: "Logged in from Safari on iPhone", timestamp: "2025-03-23T09:10:00Z" },
      { id: "act_005", type: "order", description: "Placed order #ORD-7827", timestamp: "2025-04-07T11:30:00Z" },
    ],
  },
  {
    id: "usr_003",
    email: "emma.wilson@example.com",
    fullName: "Emma Wilson",
    displayName: "Emma W",
    role: "CUSTOMER",
    status: "active",
    avatar: null,
    joinedAt: "2024-03-10T11:20:00Z",
    lastActive: "2025-03-21T18:45:00Z",
    totalOrders: 5,
    totalSpent: 567.25,
    avgOrderValue: 113.45,
    phone: "+1 (555) 345-6789",
    location: "New York, NY",
    orders: [
      { id: "ORD-7826", date: "2025-04-07", amount: 67.25, status: "completed", items: 1 },
    ],
    activityLog: [
      { id: "act_006", type: "login", description: "Logged in from Firefox on Windows", timestamp: "2025-03-21T18:45:00Z" },
    ],
  },
  {
    id: "usr_004",
    email: "alex.rivera@example.com",
    fullName: "Alex Rivera",
    displayName: "Alex R",
    role: "ADMIN",
    status: "active",
    avatar: null,
    joinedAt: "2023-05-01T09:00:00Z",
    lastActive: "2025-03-23T20:30:00Z",
    totalOrders: 24,
    totalSpent: 3890.75,
    avgOrderValue: 162.11,
    phone: "+1 (555) 456-7890",
    location: "Austin, TX",
    bio: "Platform administrator and design enthusiast",
    orders: [
      { id: "ORD-7823", date: "2025-04-06", amount: 299.99, status: "completed", items: 4 },
      { id: "ORD-7780", date: "2025-03-20", amount: 156.00, status: "completed", items: 2 },
    ],
    activityLog: [
      { id: "act_007", type: "login", description: "Admin login from Chrome on macOS", timestamp: "2025-03-23T20:30:00Z" },
      { id: "act_008", type: "role_change", description: "Changed role of user usr_015", timestamp: "2025-03-22T14:00:00Z", metadata: { targetUser: "usr_015", oldRole: "CUSTOMER", newRole: "ARTIST" } },
    ],
  },
  {
    id: "usr_005",
    email: "james.brown@example.com",
    fullName: "James Brown",
    displayName: "James B",
    role: "CUSTOMER",
    status: "inactive",
    avatar: null,
    joinedAt: "2023-11-05T16:45:00Z",
    lastActive: "2025-02-15T10:20:00Z",
    totalOrders: 3,
    totalSpent: 450.00,
    avgOrderValue: 150.00,
    location: "Chicago, IL",
    orders: [
      { id: "ORD-7825", date: "2025-04-07", amount: 189.99, status: "shipped", items: 2 },
    ],
    activityLog: [
      { id: "act_009", type: "login", description: "Last login", timestamp: "2025-02-15T10:20:00Z" },
      { id: "act_010", type: "status_change", description: "Account deactivated due to inactivity", timestamp: "2025-03-01T00:00:00Z" },
    ],
  },
  {
    id: "usr_006",
    email: "lisa.davis@example.com",
    fullName: "Lisa Davis",
    displayName: "Lisa D",
    role: "ARTIST",
    status: "active",
    avatar: null,
    joinedAt: "2024-02-18T13:30:00Z",
    lastActive: "2025-03-22T22:15:00Z",
    totalOrders: 15,
    totalSpent: 2156.00,
    avgOrderValue: 143.73,
    phone: "+1 (555) 567-8901",
    location: "Miami, FL",
    bio: "Neo-traditional tattoo artist",
    orders: [
      { id: "ORD-7824", date: "2025-04-06", amount: 156.00, status: "cancelled", items: 2 },
      { id: "ORD-7745", date: "2025-03-10", amount: 234.50, status: "completed", items: 3 },
    ],
    activityLog: [
      { id: "act_011", type: "login", description: "Logged in from Chrome on Windows", timestamp: "2025-03-22T22:15:00Z" },
    ],
  },
  {
    id: "usr_007",
    email: "michael.lee@example.com",
    fullName: "Michael Lee",
    displayName: "Mike Lee",
    role: "DEVELOPER",
    status: "active",
    avatar: null,
    joinedAt: "2023-06-12T10:00:00Z",
    lastActive: "2025-03-23T19:45:00Z",
    totalOrders: 18,
    totalSpent: 2678.90,
    avgOrderValue: 148.83,
    phone: "+1 (555) 678-9012",
    location: "Seattle, WA",
    bio: "Full-stack developer and tattoo collector",
    orders: [
      { id: "ORD-7822", date: "2025-04-05", amount: 78.50, status: "processing", items: 1 },
      { id: "ORD-7799", date: "2025-03-18", amount: 445.00, status: "completed", items: 5 },
    ],
    activityLog: [
      { id: "act_012", type: "login", description: "Dev login from VS Code terminal", timestamp: "2025-03-23T19:45:00Z" },
    ],
  },
  {
    id: "usr_008",
    email: "jennifer.taylor@example.com",
    fullName: "Jennifer Taylor",
    displayName: "Jen Taylor",
    role: "CUSTOMER",
    status: "suspended",
    avatar: null,
    joinedAt: "2024-04-20T08:15:00Z",
    lastActive: "2025-03-10T12:00:00Z",
    totalOrders: 2,
    totalSpent: 178.50,
    avgOrderValue: 89.25,
    orders: [],
    activityLog: [
      { id: "act_013", type: "status_change", description: "Account suspended - payment dispute", timestamp: "2025-03-15T00:00:00Z" },
    ],
  },
  {
    id: "usr_009",
    email: "david.kim@example.com",
    fullName: "David Kim",
    displayName: "David K",
    role: "ARTIST",
    status: "active",
    avatar: null,
    joinedAt: "2023-09-30T15:20:00Z",
    lastActive: "2025-03-23T16:30:00Z",
    totalOrders: 31,
    totalSpent: 4523.75,
    avgOrderValue: 145.93,
    phone: "+1 (555) 789-0123",
    location: "Portland, OR",
    bio: "Japanese traditional tattoo specialist",
    orders: [
      { id: "ORD-7821", date: "2025-04-05", amount: 567.00, status: "processing", items: 6 },
      { id: "ORD-7800", date: "2025-03-19", amount: 234.00, status: "completed", items: 3 },
    ],
    activityLog: [
      { id: "act_014", type: "login", description: "Logged in from Safari on iPad", timestamp: "2025-03-23T16:30:00Z" },
    ],
  },
  {
    id: "usr_010",
    email: "admin@stigmator.com",
    fullName: "Super Admin",
    displayName: "Super Admin",
    role: "SUPER_ADMIN",
    status: "active",
    avatar: null,
    joinedAt: "2023-01-01T00:00:00Z",
    lastActive: "2025-03-23T21:00:00Z",
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    phone: "+1 (555) 000-0000",
    location: "System",
    orders: [],
    activityLog: [
      { id: "act_015", type: "login", description: "System admin login", timestamp: "2025-03-23T21:00:00Z" },
    ],
  },
  {
    id: "usr_011",
    email: "sophie.martin@example.com",
    fullName: "Sophie Martin",
    displayName: "Sophie M",
    role: "CUSTOMER",
    status: "pending",
    avatar: null,
    joinedAt: "2025-03-20T11:00:00Z",
    lastActive: "2025-03-20T11:30:00Z",
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    location: "Denver, CO",
    orders: [],
    activityLog: [
      { id: "act_016", type: "login", description: "Account created, email verification pending", timestamp: "2025-03-20T11:00:00Z" },
    ],
  },
  {
    id: "usr_012",
    email: "robert.garcia@example.com",
    fullName: "Robert Garcia",
    displayName: "Rob G",
    role: "ARTIST",
    status: "active",
    avatar: null,
    joinedAt: "2023-07-15T09:45:00Z",
    lastActive: "2025-03-22T20:00:00Z",
    totalOrders: 22,
    totalSpent: 3245.50,
    avgOrderValue: 147.52,
    phone: "+1 (555) 890-1234",
    location: "San Diego, CA",
    bio: "Black and grey realism specialist",
    orders: [
      { id: "ORD-7819", date: "2025-04-04", amount: 189.00, status: "completed", items: 2 },
    ],
    activityLog: [
      { id: "act_017", type: "login", description: "Logged in from Chrome on Android", timestamp: "2025-03-22T20:00:00Z" },
    ],
  },
  {
    id: "usr_013",
    email: "amanda.white@example.com",
    fullName: "Amanda White",
    displayName: "Amanda W",
    role: "CUSTOMER",
    status: "active",
    avatar: null,
    joinedAt: "2024-05-12T14:30:00Z",
    lastActive: "2025-03-21T15:20:00Z",
    totalOrders: 9,
    totalSpent: 1234.60,
    avgOrderValue: 137.18,
    phone: "+1 (555) 901-2345",
    location: "Boston, MA",
    orders: [
      { id: "ORD-7818", date: "2025-04-04", amount: 145.99, status: "shipped", items: 2 },
    ],
    activityLog: [
      { id: "act_018", type: "login", description: "Logged in from Edge on Windows", timestamp: "2025-03-21T15:20:00Z" },
    ],
  },
  {
    id: "usr_014",
    email: "chris.anderson@example.com",
    fullName: "Chris Anderson",
    displayName: "Chris A",
    role: "DEVELOPER",
    status: "active",
    avatar: null,
    joinedAt: "2023-04-10T11:15:00Z",
    lastActive: "2025-03-23T18:00:00Z",
    totalOrders: 14,
    totalSpent: 1876.40,
    avgOrderValue: 134.03,
    phone: "+1 (555) 012-3456",
    location: "Remote",
    bio: "Backend engineer",
    orders: [
      { id: "ORD-7817", date: "2025-04-03", amount: 299.00, status: "pending", items: 4 },
    ],
    activityLog: [
      { id: "act_019", type: "login", description: "Logged in from terminal", timestamp: "2025-03-23T18:00:00Z" },
    ],
  },
  {
    id: "usr_015",
    email: "natalie.baker@example.com",
    fullName: "Natalie Baker",
    displayName: "Natalie B",
    role: "ARTIST",
    status: "active",
    avatar: null,
    joinedAt: "2024-06-01T10:00:00Z",
    lastActive: "2025-03-23T14:45:00Z",
    totalOrders: 11,
    totalSpent: 1567.80,
    avgOrderValue: 142.53,
    phone: "+1 (555) 111-2222",
    location: "Las Vegas, NV",
    bio: "Watercolor tattoo artist",
    orders: [
      { id: "ORD-7816", date: "2025-04-03", amount: 178.50, status: "processing", items: 2 },
    ],
    activityLog: [
      { id: "act_020", type: "login", description: "Logged in from Chrome on macOS", timestamp: "2025-03-23T14:45:00Z" },
      { id: "act_021", type: "role_change", description: "Role upgraded to ARTIST", timestamp: "2025-03-22T14:00:00Z" },
    ],
  },
  {
    id: "usr_016",
    email: "kevin.murphy@example.com",
    fullName: "Kevin Murphy",
    displayName: "Kev M",
    role: "CUSTOMER",
    status: "active",
    avatar: null,
    joinedAt: "2024-07-20T16:00:00Z",
    lastActive: "2025-03-22T12:30:00Z",
    totalOrders: 6,
    totalSpent: 789.90,
    avgOrderValue: 131.65,
    location: "Phoenix, AZ",
    orders: [
      { id: "ORD-7815", date: "2025-04-02", amount: 134.99, status: "completed", items: 2 },
    ],
    activityLog: [
      { id: "act_022", type: "login", description: "Logged in from Firefox on Linux", timestamp: "2025-03-22T12:30:00Z" },
    ],
  },
  {
    id: "usr_017",
    email: "rachel.green@example.com",
    fullName: "Rachel Green",
    displayName: "Rachel G",
    role: "CUSTOMER",
    status: "inactive",
    avatar: null,
    joinedAt: "2023-12-05T09:30:00Z",
    lastActive: "2025-01-15T10:00:00Z",
    totalOrders: 4,
    totalSpent: 456.00,
    avgOrderValue: 114.00,
    location: "Atlanta, GA",
    orders: [],
    activityLog: [
      { id: "act_023", type: "login", description: "Last login", timestamp: "2025-01-15T10:00:00Z" },
    ],
  },
  {
    id: "usr_018",
    email: "daniel.wright@example.com",
    fullName: "Daniel Wright",
    displayName: "Dan Wright",
    role: "ADMIN",
    status: "active",
    avatar: null,
    joinedAt: "2023-03-20T08:00:00Z",
    lastActive: "2025-03-23T17:30:00Z",
    totalOrders: 19,
    totalSpent: 2789.50,
    avgOrderValue: 146.82,
    phone: "+1 (555) 222-3333",
    location: "Dallas, TX",
    orders: [
      { id: "ORD-7814", date: "2025-04-02", amount: 234.00, status: "completed", items: 3 },
    ],
    activityLog: [
      { id: "act_024", type: "login", description: "Admin login", timestamp: "2025-03-23T17:30:00Z" },
    ],
  },
  {
    id: "usr_019",
    email: "olivia.scott@example.com",
    fullName: "Olivia Scott",
    displayName: "Olivia S",
    role: "ARTIST",
    status: "active",
    avatar: null,
    joinedAt: "2024-08-15T13:45:00Z",
    lastActive: "2025-03-23T20:15:00Z",
    totalOrders: 13,
    totalSpent: 1987.25,
    avgOrderValue: 152.87,
    phone: "+1 (555) 333-4444",
    location: "Nashville, TN",
    bio: "Minimalist tattoo designs",
    orders: [
      { id: "ORD-7813", date: "2025-04-01", amount: 156.00, status: "shipped", items: 2 },
    ],
    activityLog: [
      { id: "act_025", type: "login", description: "Logged in from Safari on iPhone", timestamp: "2025-03-23T20:15:00Z" },
    ],
  },
  {
    id: "usr_020",
    email: "brandon.king@example.com",
    fullName: "Brandon King",
    displayName: "Brandon K",
    role: "CUSTOMER",
    status: "active",
    avatar: null,
    joinedAt: "2024-09-10T11:30:00Z",
    lastActive: "2025-03-22T19:00:00Z",
    totalOrders: 7,
    totalSpent: 945.50,
    avgOrderValue: 135.07,
    location: "Philadelphia, PA",
    orders: [
      { id: "ORD-7812", date: "2025-04-01", amount: 198.00, status: "pending", items: 3 },
    ],
    activityLog: [
      { id: "act_026", type: "login", description: "Logged in from Chrome on Windows", timestamp: "2025-03-22T19:00:00Z" },
    ],
  },
];

// Process customers with avatars
export const customers: Customer[] = mockCustomers.map(c => ({
  ...c,
  avatar: c.avatar || getAvatar(c.fullName),
}));

// Customer stats
export const customerStats = {
  total: customers.length,
  active: customers.filter(c => c.status === "active").length,
  inactive: customers.filter(c => c.status === "inactive").length,
  suspended: customers.filter(c => c.status === "suspended").length,
  pending: customers.filter(c => c.status === "pending").length,
  customers: customers.filter(c => c.role === "CUSTOMER").length,
  artists: customers.filter(c => c.role === "ARTIST").length,
  admins: customers.filter(c => c.role === "ADMIN" || c.role === "SUPER_ADMIN").length,
  developers: customers.filter(c => c.role === "DEVELOPER").length,
  totalRevenue: customers.reduce((acc, c) => acc + c.totalSpent, 0),
  totalOrders: customers.reduce((acc, c) => acc + c.totalOrders, 0),
};
