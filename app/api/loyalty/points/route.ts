import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyTransactionModel } from '@/app/modals/loyaltyTransactionModel';
import { ConnectDB } from '@/app/config/db';
import { LoyaltyPointsModel } from '@/app/modals/rewardModel';
ConnectDB()
console.log("registering" + LoyaltyPointsModel)
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }


  let loyaltyPoints = 0;
  const transactions = await LoyaltyTransactionModel
    .find({ "email":email })
    .populate({path:'bonusID',options: { strictPopulate: false }});
console.log("Transactions" + transactions.length )
  for (const tx of transactions) {
    if (tx.reason === "purchase") {
      loyaltyPoints += tx.amount;
    } else if (tx.bonusID && tx.bonusID.bonusPoints) {
      loyaltyPoints += tx.bonusID.bonusPoints;
    }
  }

  return NextResponse.json({ loyaltyPoints });
} 