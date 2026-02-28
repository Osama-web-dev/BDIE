import { NextResponse } from 'next/server';
import { getDbData, saveDbData } from '@/lib/jsonDb';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { read } = await req.json();
    const db = getDbData();

    const notifIndex = db.notifications.findIndex((n: any) => n._id === id);
    
    if (notifIndex === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    db.notifications[notifIndex].read = read;
    saveDbData(db);

    return NextResponse.json({ notification: db.notifications[notifIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
