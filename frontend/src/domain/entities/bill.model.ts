export interface BillShare {
  username: string;
  score: number;
  rank: number;
  percentage: number;
  amount: number;
}

export interface Bill {
  totalAmount: number;
  drinkType: string;
  shares: BillShare[];
}

export interface CreateBillPayload {
  totalAmount: number;
  drinkType: string;
}