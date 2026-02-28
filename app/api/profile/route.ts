import { NextResponse } from 'next/server';
import { getDbData, saveDbData } from '@/lib/jsonDb';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updates = await req.json();
    const db = getDbData();
    
    const userIndex = db.users.findIndex((u: any) => u._id === token.value);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow updating certain fields
    if (updates.name) db.users[userIndex].name = updates.name;
    if (updates.department) db.users[userIndex].department = updates.department;
    
    saveDbData(db);

    return NextResponse.json({ user: db.users[userIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
