import { NextResponse } from 'next/server';
import { getDbData, saveDbData } from '@/lib/jsonDb';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const db = getDbData();
    
    let user = db.users.find((u: any) => u.email === email);
    
    if (!user) {
      user = {
        _id: `user-${Date.now()}`,
        name: 'Admin User',
        email: email || 'admin@bdie.io',
        role: 'Administrator',
        department: 'Security Operations',
        baseline_profile: { activity_level: 'high' },
        risk_score: 12
      };
      db.users.push(user);
      saveDbData(db);
    }

    const response = NextResponse.json({ user });
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth_token', user._id.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
