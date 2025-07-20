import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyTransactionModel } from '@/app/modals/loyaltyTransactionModel';
import { ConnectDB } from '@/app/config/db';

ConnectDB()
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userID = searchParams.get('userID');
  if (!userID) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  const transactions = await LoyaltyTransactionModel.find({ userID }).sort({ timestamp: -1 });
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type, bonusID } = body;

    if (!email || !type) {
      return NextResponse.json({ error: 'userID, points, and type are required' }, { status: 400 });
    }

    const newTransaction = await LoyaltyTransactionModel.create({
      email,
      type,
      bonusID,
      timestamp: new Date(),
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction', details: error }, { status: 500 });
  }
} 

