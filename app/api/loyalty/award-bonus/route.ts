import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyTransactionModel } from '@/app/modals/loyaltyTransactionModel';
import { ConnectDB } from '@/app/config/db';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await ConnectDB();
    
    const { email, bonusType } = await req.json();
    
    if (!email || !bonusType) {
      return NextResponse.json({ error: 'Email and bonusType are required' }, { status: 400 });
    }

    // Check if user already has this bonus
    const existingTransaction = await LoyaltyTransactionModel.findOne({
      email,
      reason: bonusType === 'birthday' ? 'birthday' : 'wedding day'
    });

    if (existingTransaction) {
      return NextResponse.json({ 
        success: false, 
        message: 'Bonus already awarded for this event' 
      });
    }

    // Define bonus IDs and amounts
    const bonusConfig = {
      birthday: {
        bonusID: new mongoose.Types.ObjectId('688a9abe251412e3502a832e'),
        reason: 'birthday',
        amount: 50
      },
      wedding: {
        bonusID: new mongoose.Types.ObjectId('68846cdd8caf791c78a876b9'),
        reason: 'wedding day',
        amount: 50
      }
    };

    const config = bonusConfig[bonusType as keyof typeof bonusConfig];
    
    if (!config) {
      return NextResponse.json({ error: 'Invalid bonus type' }, { status: 400 });
    }

    // Create loyalty transaction
    const transaction = new LoyaltyTransactionModel({
      email,
      type: 'earn',
      reason: config.reason,
      amount: config.amount,
      bonusID: config.bonusID,
      timestamp: new Date()
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      message: `Congratulations! You've earned ${config.amount} loyalty points for adding your ${config.reason}!`,
      points: config.amount
    });

  } catch (error) {
    console.error('Error awarding loyalty bonus:', error);
    return NextResponse.json({ 
      error: 'Failed to award loyalty bonus' 
    }, { status: 500 });
  }
}