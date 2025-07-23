import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyTransactionModel } from '@/app/modals/loyaltyTransactionModel';
import { ConnectDB } from '@/app/config/db';
ConnectDB();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const transactions = await LoyaltyTransactionModel
      .find({ email })
      .populate({ path: 'bonusID', options: { strictPopulate: false } })
      .sort({ createdAt: -1 });
    console.log("transactionsHere" + transactions );
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
} 

