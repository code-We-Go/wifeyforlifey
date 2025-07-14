import { NextRequest, NextResponse } from 'next/server';
import { ConnectDB } from '@/app/config/db';
import UserModel from '@/app/modals/userModel';

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email }).select('-password');
    console.log("user:" + user)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageURL: user.imageURL,
        emailVerified: user.emailVerified,
        isSubscribed: user.isSubscribed,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ConnectDB();
    
    const body = await request.json();
    const { email, username, firstName, lastName, imageURL } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      {
        username,
        firstName,
        lastName,
        imageURL
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        imageURL: updatedUser.imageURL,
        emailVerified: updatedUser.emailVerified,
        isSubscribed: updatedUser.isSubscribed,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 