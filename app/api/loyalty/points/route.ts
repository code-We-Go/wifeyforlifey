import { NextRequest, NextResponse } from "next/server";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { ConnectDB } from "@/app/config/db";
import { LoyaltyPointsModel } from "@/app/modals/rewardModel";
ConnectDB();
console.log("registering" + LoyaltyPointsModel);
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  let lifeTimePoints = 0;
  let SpentLoyaltyPoints = 0;
  const transactions = await LoyaltyTransactionModel.find({
    email: email,
  }).populate({ path: "bonusID", options: { strictPopulate: false } });
  console.log("Transactions" + transactions.length);
  for (const tx of transactions) {
    console.log(`Processing transaction: type=${tx.type}, amount=${tx.amount}, reason=${tx.reason}`);
    if (tx.type === "earn") {
      if (tx.reason === "purchase") {
        const amount = Number(tx.amount) || 0;
        lifeTimePoints += amount;
        console.log(`Added purchase points: ${amount}, total: ${lifeTimePoints}`);
      } else if (tx.bonusID && tx.bonusID.bonusPoints) {
        const bonusPoints = Number(tx.bonusID.bonusPoints) || 0;
        lifeTimePoints += bonusPoints;
        console.log(`Added bonus points: ${bonusPoints}, total: ${lifeTimePoints}`);
      } else {
        const amount = Number(tx.amount) || 0;
        lifeTimePoints += amount;
        console.log(`Added other earn points: ${amount}, total: ${lifeTimePoints}`);
      }
    } else if (tx.type === "spend") {
      const amount = Number(tx.amount) || 0;
      SpentLoyaltyPoints += amount;
      console.log(`Added spent points: ${amount}, total spent: ${SpentLoyaltyPoints}`);
    }
  }

  const loyaltyPoints = {
    lifeTimePoints: lifeTimePoints,
    realLoyaltyPoints: lifeTimePoints - SpentLoyaltyPoints,
  };
  console.log("lifeTime" + lifeTimePoints, "spent" + SpentLoyaltyPoints);
  return NextResponse.json({ loyaltyPoints });
}
