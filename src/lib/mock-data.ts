import { Transaction, Card, CardTransaction, CardFlow } from "@/types";

// ===== XSS Test Transaction (Section 5.1) =====
// One transaction intentionally contains a script tag to test XSS prevention
const XSS_PAYLOAD = '<script>alert("xss")</script>';

export const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    reference: "REF-2025-001",
    sender: "Emmanuel Israel",
    recipient: "Ruth Okafor",
    amount: -7.64,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "outflow",
    description: "Transfer to Ruth",
    date: "2025-04-18T19:32:00Z",
    cardLast4: "7093",
  },
  {
    id: "txn_002",
    reference: "REF-2025-002",
    sender: "Emmanuel Israel",
    recipient: "Wallet",
    amount: -14,
    currency: "USD",
    status: "completed",
    type: "wallet",
    direction: "outflow",
    description: "Wallet to wallet",
    date: "2025-03-02T08:12:00Z",
  },
  {
    id: "txn_003",
    reference: "REF-2025-003",
    sender: "Tochukwu Eze",
    recipient: "Emmanuel Israel",
    amount: 850.89,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "inflow",
    description: "Transfer from Tochukwu",
    date: "2025-02-07T23:50:00Z",
  },
  {
    id: "txn_004",
    reference: "REF-2025-004",
    sender: "Tobi Adewale",
    recipient: "Emmanuel Israel",
    amount: 3.0,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "inflow",
    description: "Transfer from Tobi",
    date: "2025-03-02T06:59:00Z",
  },
  {
    id: "txn_005",
    reference: "REF-2025-005",
    sender: "Emmanuel Israel",
    recipient: "Esrael Nwosu",
    amount: -200,
    currency: "USD",
    status: "completed",
    type: "PTA",
    direction: "outflow",
    description: "Transfer to Esrael",
    date: "2025-03-02T10:08:00Z",
  },
  {
    id: "txn_006",
    reference: "REF-2025-006",
    sender: "Emmanuel Israel",
    recipient: "Wallet",
    amount: -10.53,
    currency: "USD",
    status: "completed",
    type: "wallet",
    direction: "outflow",
    description: "Wallet to wallet",
    date: "2025-02-19T16:27:00Z",
  },
  {
    id: "txn_007",
    reference: "REF-2025-007",
    sender: "Tochukwu Eze",
    recipient: "Emmanuel Israel",
    amount: 850.89,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "inflow",
    description: "Transfer from Tochukwu",
    date: "2025-02-07T23:50:00Z",
  },
  // XSS Test Transaction
  {
    id: "txn_008",
    reference: "REF-2025-008",
    sender: XSS_PAYLOAD,
    recipient: "Emmanuel Israel",
    amount: 500,
    currency: "USD",
    status: "pending",
    type: "FX",
    direction: "inflow",
    description: `Payment from ${XSS_PAYLOAD}`,
    date: "2025-04-20T10:00:00Z",
  },
  {
    id: "txn_009",
    reference: "REF-2025-009",
    sender: "Medical Corp",
    recipient: "Emmanuel Israel",
    amount: -1250,
    currency: "USD",
    status: "completed",
    type: "Medicals",
    direction: "outflow",
    description: "Medical insurance payment",
    date: "2025-03-15T09:00:00Z",
  },
  {
    id: "txn_010",
    reference: "REF-2025-010",
    sender: "Emmanuel Israel",
    recipient: "Lagos BTA Office",
    amount: -5000,
    currency: "USD",
    status: "pending",
    type: "BTA",
    direction: "outflow",
    description: "Business Travel Allowance application",
    date: "2025-04-01T14:30:00Z",
  },
  {
    id: "txn_011",
    reference: "REF-2025-011",
    sender: "John Doe",
    recipient: "Emmanuel Israel",
    amount: 2500,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "inflow",
    description: "Foreign exchange purchase",
    date: "2025-03-20T11:00:00Z",
  },
  {
    id: "txn_012",
    reference: "REF-2025-012",
    sender: "Emmanuel Israel",
    recipient: "Chioma Obi",
    amount: -75.5,
    currency: "USD",
    status: "failed",
    type: "FX",
    direction: "outflow",
    description: "FX transfer failed - insufficient balance",
    date: "2025-04-10T16:45:00Z",
  },
  {
    id: "txn_013",
    reference: "REF-2025-013",
    sender: "PTA Board",
    recipient: "Emmanuel Israel",
    amount: 150,
    currency: "USD",
    status: "completed",
    type: "PTA",
    direction: "inflow",
    description: "PTA contribution refund",
    date: "2025-03-28T08:15:00Z",
  },
  {
    id: "txn_014",
    reference: "REF-2025-014",
    sender: "Emmanuel Israel",
    recipient: "Federal Medical Center",
    amount: -320,
    currency: "USD",
    status: "completed",
    type: "Medicals",
    direction: "outflow",
    description: "Hospital bill payment",
    date: "2025-04-05T13:20:00Z",
  },
  {
    id: "txn_015",
    reference: "REF-2025-015",
    sender: "Emmanuel Israel",
    recipient: "UK Embassy",
    amount: -180,
    currency: "USD",
    status: "completed",
    type: "BTA",
    direction: "outflow",
    description: "BTA documentation fee",
    date: "2025-02-25T10:00:00Z",
  },
  {
    id: "txn_016",
    reference: "REF-2025-016",
    sender: "Grace Afolabi",
    recipient: "Emmanuel Israel",
    amount: 430,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "inflow",
    description: "Freelance payment received",
    date: "2025-04-12T09:30:00Z",
  },
  {
    id: "txn_017",
    reference: "REF-2025-017",
    sender: "Emmanuel Israel",
    recipient: "MTN Wallet",
    amount: -25,
    currency: "USD",
    status: "completed",
    type: "wallet",
    direction: "outflow",
    description: "Mobile wallet top-up",
    date: "2025-03-10T17:00:00Z",
  },
  {
    id: "txn_018",
    reference: "REF-2025-018",
    sender: "Emmanuel Israel",
    recipient: "Dr. Bello Clinic",
    amount: -90,
    currency: "USD",
    status: "pending",
    type: "Medicals",
    direction: "outflow",
    description: "Lab test payment",
    date: "2025-04-15T11:45:00Z",
  },
  {
    id: "txn_019",
    reference: "REF-2025-019",
    sender: "FX Bureau",
    recipient: "Emmanuel Israel",
    amount: 1200,
    currency: "USD",
    status: "completed",
    type: "FX",
    direction: "inflow",
    description: "FX conversion completed",
    date: "2025-03-05T14:00:00Z",
  },
  {
    id: "txn_020",
    reference: "REF-2025-020",
    sender: "Emmanuel Israel",
    recipient: "WAEC Board",
    amount: -45,
    currency: "USD",
    status: "completed",
    type: "PTA",
    direction: "outflow",
    description: "Exam registration fee",
    date: "2025-02-20T08:30:00Z",
  },
  // Additional transactions for pagination testing
  ...generateBulkTransactions(21, 50),
];

function generateBulkTransactions(
  startIdx: number,
  endIdx: number,
): Transaction[] {
  const statuses: Transaction["status"][] = [
    "completed",
    "pending",
    "failed",
    "completed",
    "completed",
  ];
  const types: Transaction["type"][] = [
    "FX",
    "PTA",
    "BTA",
    "Medicals",
    "wallet",
  ];
  const names = [
    "Ade Bankole",
    "Fatima Yusuf",
    "Olu Ogunyemi",
    "Blessing Okoro",
    "Ibrahim Musa",
    "Ngozi Eze",
    "Samuel Ajayi",
    "Kemi Adeola",
    "Chidi Nwankwo",
    "Halima Bello",
  ];

  const transactions: Transaction[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const isInflow = Math.random() > 0.5;
    const amount = Math.round((Math.random() * 2000 + 10) * 100) / 100;
    const name = names[i % names.length];
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];

    transactions.push({
      id: `txn_${String(i).padStart(3, "0")}`,
      reference: `REF-2025-${String(i).padStart(3, "0")}`,
      sender: isInflow ? name : "Emmanuel Israel",
      recipient: isInflow ? "Emmanuel Israel" : name,
      amount: isInflow ? amount : -amount,
      currency: "USD",
      status,
      type,
      direction: isInflow ? "inflow" : "outflow",
      description: isInflow ? `Transfer from ${name}` : `Transfer to ${name}`,
      date: new Date(
        2025,
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 28) + 1,
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
      ).toISOString(),
    });
  }
  return transactions;
}

// ===== Card Mock Data =====
export const mockCard: Card = {
  id: "card_001",
  type: "Prepaid card",
  last4: "7093",
  expiry: "08/27",
  holder: "Emmanuel Israel",
  balance: 3048.0,
  brand: "VISA",
};

export const mockCardTransactions: CardTransaction[] = [
  {
    id: "ct_001",
    description: "Transfer to Ruth",
    date: "2025-04-18T19:32:00Z",
    amount: -7.64,
    direction: "outflow",
  },
  {
    id: "ct_002",
    description: "Wallet to wallet",
    date: "2025-03-02T08:12:00Z",
    amount: -14,
    direction: "outflow",
  },
  {
    id: "ct_003",
    description: "Transfer from Tochukwu",
    date: "2025-02-07T23:50:00Z",
    amount: 850.89,
    direction: "inflow",
  },
];

export const mockCardFlow: CardFlow = {
  moneyIn: 4046.0,
  moneyOut: 1046.0,
  total: 3048.0,
};

// ===== New Transaction Generator for SSE =====
export function generateNewTransaction(): Transaction {
  const names = [
    "Kemi Johnson",
    "Tunde Bakare",
    "Zainab Mohammed",
    "Chukwuma Obi",
    "Amina Danjuma",
  ];
  const types: Transaction["type"][] = [
    "FX",
    "PTA",
    "BTA",
    "Medicals",
    "wallet",
  ];
  const isInflow = Math.random() > 0.5;
  const amount = Math.round((Math.random() * 1000 + 5) * 100) / 100;
  const name = names[Math.floor(Math.random() * names.length)];
  const id = `txn_sse_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    reference: `REF-LIVE-${id.slice(-6).toUpperCase()}`,
    sender: isInflow ? name : "Emmanuel Israel",
    recipient: isInflow ? "Emmanuel Israel" : name,
    amount: isInflow ? amount : -amount,
    currency: "USD",
    status: "pending",
    type: types[Math.floor(Math.random() * types.length)],
    direction: isInflow ? "inflow" : "outflow",
    description: isInflow ? `Transfer from ${name}` : `Transfer to ${name}`,
    date: new Date().toISOString(),
  };
}
