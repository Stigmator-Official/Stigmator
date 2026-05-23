import type { OrderStatus } from "@/lib/api/orders";

export interface MockOrderItem {
  id: string;
  order_id: string;
  product_design_id: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
  product_design: {
    design: {
      title: string;
      images: string[];
      artist: {
        id: string;
        display_name: string;
      };
    };
    product: {
      name: string;
    };
  };
}

export interface MockOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
  items: MockOrderItem[];
  // Additional fields for admin
  notes?: OrderNote[];
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  payment_method?: string;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;
}

export interface OrderNote {
  id: string;
  order_id: string;
  author: string;
  content: string;
  created_at: string;
  type: "note" | "status_change" | "system" | "customer";
}

// Sample notes generator
function generateNotes(orderId: string, status: OrderStatus): OrderNote[] {
  const notes: OrderNote[] = [
    {
      id: `note_${orderId}_1`,
      order_id: orderId,
      author: "System",
      content: "Order created successfully",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: "system",
    },
  ];

  if (["confirmed", "processing", "shipped", "delivered"].includes(status)) {
    notes.push({
      id: `note_${orderId}_2`,
      order_id: orderId,
      author: "System",
      content: "Payment confirmed via Stripe",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      type: "system",
    });
  }

  if (["processing", "shipped", "delivered"].includes(status)) {
    notes.push({
      id: `note_${orderId}_3`,
      order_id: orderId,
      author: "Sarah (Fulfillment)",
      content: "Order sent to fulfillment center for processing",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: "status_change",
    });
  }

  if (["shipped", "delivered"].includes(status)) {
    notes.push({
      id: `note_${orderId}_4`,
      order_id: orderId,
      author: "Mike (Warehouse)",
      content: "Order packed and shipped via USPS Priority",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: "status_change",
    });
  }

  if (status === "delivered") {
    notes.push({
      id: `note_${orderId}_5`,
      order_id: orderId,
      author: "System",
      content: "Order delivered successfully",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: "system",
    });
  }

  if (status === "refunded") {
    notes.push({
      id: `note_${orderId}_refund`,
      order_id: orderId,
      author: "Admin User",
      content: "Customer requested refund due to sizing issue. Approved.",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: "note",
    });
  }

  return notes;
}

// Mock order data
export const mockOrders: MockOrder[] = [
  {
    id: "ord_001",
    user_id: "user_001",
    status: "delivered",
    subtotal: 129.99,
    shipping: 8.99,
    tax: 11.05,
    total: 149.03,
    shipping_address: {
      first_name: "Alex",
      last_name: "Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Maple Street, Apt 4B",
      city: "Portland",
      state: "OR",
      zip_code: "97201",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_001",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_001",
        order_id: "ord_001",
        product_design_id: "pd_001",
        quantity: 1,
        unit_price: 79.99,
        size: "L",
        color: "Black",
        product_design: {
          design: {
            title: "Dragon Ink",
            images: ["/images/designs/dragon-ink.jpg"],
            artist: {
              id: "artist_001",
              display_name: "Marcus Chen",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
      {
        id: "item_002",
        order_id: "ord_001",
        product_design_id: "pd_002",
        quantity: 1,
        unit_price: 49.99,
        size: "M",
        color: "White",
        product_design: {
          design: {
            title: "Geometric Wolf",
            images: ["/images/designs/wolf-geo.jpg"],
            artist: {
              id: "artist_002",
              display_name: "Sofia Rodriguez",
            },
          },
          product: {
            name: "Classic T-Shirt",
          },
        },
      },
    ],
    notes: generateNotes("ord_001", "delivered"),
    tracking_number: "9400100000000000000001",
    shipped_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "Visa ending in 4242",
  },
  {
    id: "ord_002",
    user_id: "user_002",
    status: "shipped",
    subtotal: 89.99,
    shipping: 8.99,
    tax: 7.65,
    total: 106.63,
    shipping_address: {
      first_name: "Maya",
      last_name: "Williams",
      email: "maya.w@example.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Avenue",
      city: "Austin",
      state: "TX",
      zip_code: "78701",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_002",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_003",
        order_id: "ord_002",
        product_design_id: "pd_003",
        quantity: 1,
        unit_price: 89.99,
        size: "XL",
        color: "Navy",
        product_design: {
          design: {
            title: "Japanese Waves",
            images: ["/images/designs/waves.jpg"],
            artist: {
              id: "artist_003",
              display_name: "Kenji Tanaka",
            },
          },
          product: {
            name: "Zip-Up Hoodie",
          },
        },
      },
    ],
    notes: generateNotes("ord_002", "shipped"),
    tracking_number: "9400100000000000000002",
    shipped_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "Mastercard ending in 8888",
  },
  {
    id: "ord_003",
    user_id: "user_003",
    status: "processing",
    subtotal: 159.97,
    shipping: 0,
    tax: 13.60,
    total: 173.57,
    shipping_address: {
      first_name: "Jordan",
      last_name: "Smith",
      email: "jordan.smith@example.com",
      address: "789 Pine Street, Suite 100",
      city: "Seattle",
      state: "WA",
      zip_code: "98101",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_003",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_004",
        order_id: "ord_003",
        product_design_id: "pd_004",
        quantity: 2,
        unit_price: 49.99,
        size: "M",
        color: "Black",
        product_design: {
          design: {
            title: "Tribal Phoenix",
            images: ["/images/designs/phoenix.jpg"],
            artist: {
              id: "artist_004",
              display_name: "Aria Martinez",
            },
          },
          product: {
            name: "Classic T-Shirt",
          },
        },
      },
      {
        id: "item_005",
        order_id: "ord_003",
        product_design_id: "pd_005",
        quantity: 1,
        unit_price: 59.99,
        size: "L",
        color: "Heather Grey",
        product_design: {
          design: {
            title: "Minimalist Line Art",
            images: ["/images/designs/line-art.jpg"],
            artist: {
              id: "artist_005",
              display_name: "Emma Thompson",
            },
          },
          product: {
            name: "Long Sleeve Tee",
          },
        },
      },
    ],
    notes: generateNotes("ord_003", "processing"),
    payment_method: "American Express ending in 1001",
  },
  {
    id: "ord_004",
    user_id: "user_004",
    status: "confirmed",
    subtotal: 199.99,
    shipping: 12.99,
    tax: 18.10,
    total: 231.08,
    shipping_address: {
      first_name: "Casey",
      last_name: "Brown",
      email: "casey.brown@example.com",
      phone: "+1 (555) 456-7890",
      address: "321 Elm Boulevard",
      city: "Denver",
      state: "CO",
      zip_code: "80202",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_004",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_006",
        order_id: "ord_004",
        product_design_id: "pd_006",
        quantity: 1,
        unit_price: 119.99,
        size: "L",
        color: "Black",
        product_design: {
          design: {
            title: "Sacred Geometry",
            images: ["/images/designs/sacred-geo.jpg"],
            artist: {
              id: "artist_006",
              display_name: "David Kim",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
      {
        id: "item_007",
        order_id: "ord_004",
        product_design_id: "pd_007",
        quantity: 1,
        unit_price: 79.99,
        size: "M",
        color: "Forest Green",
        product_design: {
          design: {
            title: "Norse Runes",
            images: ["/images/designs/runes.jpg"],
            artist: {
              id: "artist_007",
              display_name: "Erik Lindqvist",
            },
          },
          product: {
            name: "Crewneck Sweatshirt",
          },
        },
      },
    ],
    notes: generateNotes("ord_004", "confirmed"),
    payment_method: "PayPal",
  },
  {
    id: "ord_005",
    user_id: "user_005",
    status: "pending_payment",
    subtotal: 54.99,
    shipping: 5.99,
    tax: 4.67,
    total: 65.65,
    shipping_address: {
      first_name: "Riley",
      last_name: "Davis",
      email: "riley.davis@example.com",
      address: "555 Cedar Lane",
      city: "Nashville",
      state: "TN",
      zip_code: "37203",
      country: "USA",
    },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_008",
        order_id: "ord_005",
        product_design_id: "pd_008",
        quantity: 1,
        unit_price: 54.99,
        size: "S",
        color: "White",
        product_design: {
          design: {
            title: "Floral Mandala",
            images: ["/images/designs/mandala.jpg"],
            artist: {
              id: "artist_008",
              display_name: "Priya Patel",
            },
          },
          product: {
            name: "Women's Fitted Tee",
          },
        },
      },
    ],
    notes: generateNotes("ord_005", "pending_payment"),
  },
  {
    id: "ord_006",
    user_id: "user_006",
    status: "refunded",
    subtotal: 144.98,
    shipping: 8.99,
    tax: 13.07,
    total: 167.04,
    refund_amount: 144.98,
    refund_reason: "Customer changed mind",
    refunded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    shipping_address: {
      first_name: "Taylor",
      last_name: "Wilson",
      email: "taylor.w@example.com",
      phone: "+1 (555) 234-5678",
      address: "777 Birch Street",
      city: "Miami",
      state: "FL",
      zip_code: "33101",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_006",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_009",
        order_id: "ord_006",
        product_design_id: "pd_009",
        quantity: 1,
        unit_price: 89.99,
        size: "XL",
        color: "Black",
        product_design: {
          design: {
            title: "Skull Rose",
            images: ["/images/designs/skull-rose.jpg"],
            artist: {
              id: "artist_009",
              display_name: "Jake Morrison",
            },
          },
          product: {
            name: "Zip-Up Hoodie",
          },
        },
      },
      {
        id: "item_010",
        order_id: "ord_006",
        product_design_id: "pd_010",
        quantity: 1,
        unit_price: 54.99,
        size: "L",
        color: "Charcoal",
        product_design: {
          design: {
            title: "Street Art Graffiti",
            images: ["/images/designs/graffiti.jpg"],
            artist: {
              id: "artist_010",
              display_name: "Zoe Banks",
            },
          },
          product: {
            name: "Tank Top",
          },
        },
      },
    ],
    notes: generateNotes("ord_006", "refunded"),
    payment_method: "Visa ending in 1234",
  },
  {
    id: "ord_007",
    user_id: "user_007",
    status: "cancelled",
    subtotal: 299.97,
    shipping: 0,
    tax: 25.50,
    total: 325.47,
    shipping_address: {
      first_name: "Quinn",
      last_name: "Anderson",
      email: "quinn.anderson@example.com",
      address: "888 Spruce Court",
      city: "Chicago",
      state: "IL",
      zip_code: "60601",
      country: "USA",
    },
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_011",
        order_id: "ord_007",
        product_design_id: "pd_011",
        quantity: 3,
        unit_price: 99.99,
        size: "M",
        color: "Black",
        product_design: {
          design: {
            title: "Limited Edition Collab",
            images: ["/images/designs/collab.jpg"],
            artist: {
              id: "artist_011",
              display_name: "Studio Collective",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
    ],
    notes: [
      ...generateNotes("ord_007", "pending_payment"),
      {
        id: `note_ord_007_cancel`,
        order_id: "ord_007",
        author: "System",
        content: "Order automatically cancelled due to payment timeout",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: "system",
      },
    ],
  },
  {
    id: "ord_008",
    user_id: "user_008",
    status: "payment_failed",
    subtotal: 44.99,
    shipping: 5.99,
    tax: 3.83,
    total: 54.81,
    shipping_address: {
      first_name: "Avery",
      last_name: "Garcia",
      email: "avery.garcia@example.com",
      address: "999 Willow Road",
      city: "Phoenix",
      state: "AZ",
      zip_code: "85001",
      country: "USA",
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_012",
        order_id: "ord_008",
        product_design_id: "pd_012",
        quantity: 1,
        unit_price: 44.99,
        size: "M",
        color: "Olive",
        product_design: {
          design: {
            title: "Desert Cactus",
            images: ["/images/designs/cactus.jpg"],
            artist: {
              id: "artist_012",
              display_name: "Luna Cruz",
            },
          },
          product: {
            name: "Baseball Tee",
          },
        },
      },
    ],
    notes: [
      {
        id: `note_ord_008_1`,
        order_id: "ord_008",
        author: "System",
        content: "Payment failed: Insufficient funds",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: "system",
      },
    ],
  },
  {
    id: "ord_009",
    user_id: "user_009",
    status: "delivered",
    subtotal: 234.96,
    shipping: 0,
    tax: 19.97,
    total: 254.93,
    shipping_address: {
      first_name: "Sam",
      last_name: "Taylor",
      email: "sam.taylor@example.com",
      phone: "+1 (555) 876-5432",
      address: "111 Poplar Avenue",
      city: "Brooklyn",
      state: "NY",
      zip_code: "11201",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_009",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_013",
        order_id: "ord_009",
        product_design_id: "pd_013",
        quantity: 2,
        unit_price: 79.99,
        size: "L",
        color: "Black",
        product_design: {
          design: {
            title: "Cyber Punk Portrait",
            images: ["/images/designs/cyber.jpg"],
            artist: {
              id: "artist_013",
              display_name: "Neo Zhang",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
      {
        id: "item_014",
        order_id: "ord_009",
        product_design_id: "pd_014",
        quantity: 1,
        unit_price: 74.99,
        size: "M",
        color: "Navy",
        product_design: {
          design: {
            title: "Abstract Portrait",
            images: ["/images/designs/abstract.jpg"],
            artist: {
              id: "artist_014",
              display_name: "Isabella Romano",
            },
          },
          product: {
            name: "Artist Series Tee",
          },
        },
      },
    ],
    notes: generateNotes("ord_009", "delivered"),
    tracking_number: "9400100000000000000009",
    shipped_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "Visa ending in 5555",
  },
  {
    id: "ord_010",
    user_id: "user_010",
    status: "processing",
    subtotal: 179.98,
    shipping: 8.99,
    tax: 16.07,
    total: 205.04,
    shipping_address: {
      first_name: "Jordan",
      last_name: "Martinez",
      email: "jordan.m@example.com",
      address: "222 Redwood Drive",
      city: "San Francisco",
      state: "CA",
      zip_code: "94102",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_010",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_015",
        order_id: "ord_010",
        product_design_id: "pd_015",
        quantity: 1,
        unit_price: 89.99,
        size: "XL",
        color: "Burgundy",
        product_design: {
          design: {
            title: "Octopus Garden",
            images: ["/images/designs/octopus.jpg"],
            artist: {
              id: "artist_015",
              display_name: "Marina Costa",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
      {
        id: "item_016",
        order_id: "ord_010",
        product_design_id: "pd_016",
        quantity: 1,
        unit_price: 59.99,
        size: "L",
        color: "Sand",
        product_design: {
          design: {
            title: "Sunset Palm",
            images: ["/images/designs/palm.jpg"],
            artist: {
              id: "artist_016",
              display_name: "Kai Nakamura",
            },
          },
          product: {
            name: "Relaxed Fit Tee",
          },
        },
      },
    ],
    notes: generateNotes("ord_010", "processing"),
    payment_method: "Apple Pay",
  },
  {
    id: "ord_011",
    user_id: "user_011",
    status: "shipped",
    subtotal: 64.99,
    shipping: 5.99,
    tax: 5.53,
    total: 76.51,
    shipping_address: {
      first_name: "Parker",
      last_name: "Lee",
      email: "parker.lee@example.com",
      phone: "+1 (555) 345-6789",
      address: "333 Magnolia Way",
      city: "Atlanta",
      state: "GA",
      zip_code: "30303",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_011",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_017",
        order_id: "ord_011",
        product_design_id: "pd_017",
        quantity: 1,
        unit_price: 64.99,
        size: "M",
        color: "Forest",
        product_design: {
          design: {
            title: "Mountain Range",
            images: ["/images/designs/mountains.jpg"],
            artist: {
              id: "artist_017",
              display_name: "Sierra Wood",
            },
          },
          product: {
            name: "Long Sleeve Tee",
          },
        },
      },
    ],
    notes: generateNotes("ord_011", "shipped"),
    tracking_number: "9400100000000000000011",
    shipped_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "Google Pay",
  },
  {
    id: "ord_012",
    user_id: "user_012",
    status: "confirmed",
    subtotal: 119.98,
    shipping: 8.99,
    tax: 10.97,
    total: 139.94,
    shipping_address: {
      first_name: "Drew",
      last_name: "Thompson",
      email: "drew.t@example.com",
      address: "444 Aspen Circle",
      city: "Boston",
      state: "MA",
      zip_code: "02101",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_012",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_018",
        order_id: "ord_012",
        product_design_id: "pd_018",
        quantity: 1,
        unit_price: 69.99,
        size: "L",
        color: "Charcoal",
        product_design: {
          design: {
            title: "Lighthouse Storm",
            images: ["/images/designs/lighthouse.jpg"],
            artist: {
              id: "artist_018",
              display_name: "Cormac O'Brien",
            },
          },
          product: {
            name: "Crewneck Sweatshirt",
          },
        },
      },
      {
        id: "item_019",
        order_id: "ord_012",
        product_design_id: "pd_019",
        quantity: 1,
        unit_price: 49.99,
        size: "M",
        color: "Navy",
        product_design: {
          design: {
            title: "Compass Rose",
            images: ["/images/designs/compass.jpg"],
            artist: {
              id: "artist_019",
              display_name: "Nina Volkov",
            },
          },
          product: {
            name: "Classic T-Shirt",
          },
        },
      },
    ],
    notes: generateNotes("ord_012", "confirmed"),
    payment_method: "Mastercard ending in 7777",
  },
  {
    id: "ord_013",
    user_id: "user_013",
    status: "delivered",
    subtotal: 289.96,
    shipping: 0,
    tax: 24.65,
    total: 314.61,
    shipping_address: {
      first_name: "Reese",
      last_name: "Patel",
      email: "reese.patel@example.com",
      phone: "+1 (555) 567-8901",
      address: "555 Sequoia Street",
      city: "Los Angeles",
      state: "CA",
      zip_code: "90001",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_013",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_020",
        order_id: "ord_013",
        product_design_id: "pd_020",
        quantity: 2,
        unit_price: 119.99,
        size: "XL",
        color: "Black",
        product_design: {
          design: {
            title: "Tiger Eyes",
            images: ["/images/designs/tiger.jpg"],
            artist: {
              id: "artist_020",
              display_name: "Raj Sharma",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
      {
        id: "item_021",
        order_id: "ord_013",
        product_design_id: "pd_021",
        quantity: 1,
        unit_price: 49.99,
        size: "L",
        color: "Gold",
        product_design: {
          design: {
            title: "Lotus Flower",
            images: ["/images/designs/lotus.jpg"],
            artist: {
              id: "artist_021",
              display_name: "Mei Lin",
            },
          },
          product: {
            name: "Premium T-Shirt",
          },
        },
      },
    ],
    notes: generateNotes("ord_013", "delivered"),
    tracking_number: "9400100000000000000013",
    shipped_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "American Express ending in 9999",
  },
  {
    id: "ord_014",
    user_id: "user_014",
    status: "refunded",
    subtotal: 49.99,
    shipping: 5.99,
    tax: 4.76,
    total: 60.74,
    refund_amount: 49.99,
    refund_reason: "Item arrived damaged",
    refunded_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    shipping_address: {
      first_name: "Blake",
      last_name: "Rodriguez",
      email: "blake.r@example.com",
      address: "666 Dogwood Lane",
      city: "Dallas",
      state: "TX",
      zip_code: "75201",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_014",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_022",
        order_id: "ord_014",
        product_design_id: "pd_022",
        quantity: 1,
        unit_price: 49.99,
        size: "S",
        color: "Coral",
        product_design: {
          design: {
            title: "Hummingbird",
            images: ["/images/designs/hummingbird.jpg"],
            artist: {
              id: "artist_022",
              display_name: "Camila Santos",
            },
          },
          product: {
            name: "Women's Tank Top",
          },
        },
      },
    ],
    notes: generateNotes("ord_014", "refunded"),
    tracking_number: "9400100000000000000014",
    shipped_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "Visa ending in 3333",
  },
  {
    id: "ord_015",
    user_id: "user_015",
    status: "shipped",
    subtotal: 209.97,
    shipping: 8.99,
    tax: 18.61,
    total: 237.57,
    shipping_address: {
      first_name: "Charlie",
      last_name: "Kim",
      email: "charlie.kim@example.com",
      phone: "+1 (555) 789-0123",
      address: "777 Juniper Blvd",
      city: "San Diego",
      state: "CA",
      zip_code: "92101",
      country: "USA",
    },
    stripe_payment_intent_id: "pi_015",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_023",
        order_id: "ord_015",
        product_design_id: "pd_023",
        quantity: 1,
        unit_price: 89.99,
        size: "M",
        color: "Sage",
        product_design: {
          design: {
            title: "Bonsai Tree",
            images: ["/images/designs/bonsai.jpg"],
            artist: {
              id: "artist_023",
              display_name: "Yuki Sato",
            },
          },
          product: {
            name: "Premium Hoodie",
          },
        },
      },
      {
        id: "item_024",
        order_id: "ord_015",
        product_design_id: "pd_024",
        quantity: 2,
        unit_price: 59.99,
        size: "S",
        color: "Cream",
        product_design: {
          design: {
            title: "Cherry Blossom",
            images: ["/images/designs/sakura.jpg"],
            artist: {
              id: "artist_024",
              display_name: "Hana Yoshida",
            },
          },
          product: {
            name: "Women's Fitted Tee",
          },
        },
      },
    ],
    notes: generateNotes("ord_015", "shipped"),
    tracking_number: "9400100000000000000015",
    shipped_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: "PayPal",
  },
];

// Helper function to get order by ID
export function getMockOrderById(id: string): MockOrder | undefined {
  return mockOrders.find((order) => order.id === id);
}

// Helper function to update order status
export function updateMockOrderStatus(
  id: string,
  status: OrderStatus
): MockOrder | undefined {
  const order = mockOrders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    order.updated_at = new Date().toISOString();
    
    // Add a note for status change
    if (!order.notes) order.notes = [];
    order.notes.push({
      id: `note_${id}_${Date.now()}`,
      order_id: id,
      author: "Admin",
      content: `Status updated to ${status.replace("_", " ")}`,
      created_at: new Date().toISOString(),
      type: "status_change",
    });
    
    // Update timestamps based on status
    if (status === "shipped" && !order.shipped_at) {
      order.shipped_at = new Date().toISOString();
      order.tracking_number = `94001000000000000${id.slice(-2)}`;
    }
    if (status === "delivered" && !order.delivered_at) {
      order.delivered_at = new Date().toISOString();
    }
  }
  return order;
}

// Helper function to add note to order
export function addNoteToOrder(
  id: string,
  content: string,
  author: string = "Admin"
): OrderNote | undefined {
  const order = mockOrders.find((o) => o.id === id);
  if (order) {
    const note: OrderNote = {
      id: `note_${id}_${Date.now()}`,
      order_id: id,
      author,
      content,
      created_at: new Date().toISOString(),
      type: "note",
    };
    if (!order.notes) order.notes = [];
    order.notes.push(note);
    return note;
  }
  return undefined;
}

// Helper function to process refund
export function processMockRefund(
  id: string,
  amount: number,
  reason: string
): MockOrder | undefined {
  const order = mockOrders.find((o) => o.id === id);
  if (order) {
    order.status = "refunded";
    order.refund_amount = amount;
    order.refund_reason = reason;
    order.refunded_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();
    
    if (!order.notes) order.notes = [];
    order.notes.push({
      id: `note_${id}_refund_${Date.now()}`,
      order_id: id,
      author: "Admin",
      content: `Refund processed: $${amount.toFixed(2)} - ${reason}`,
      created_at: new Date().toISOString(),
      type: "system",
    });
  }
  return order;
}

// Helper function to delete order
export function deleteMockOrder(id: string): boolean {
  const index = mockOrders.findIndex((o) => o.id === id);
  if (index !== -1) {
    mockOrders.splice(index, 1);
    return true;
  }
  return false;
}
