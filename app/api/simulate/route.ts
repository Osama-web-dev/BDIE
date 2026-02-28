import { NextResponse } from 'next/server';
import { getDbData, saveDbData } from '@/lib/jsonDb';

export async function POST(req: Request) {
  try {
    const { scenario } = await req.json();
    const db = getDbData();

    let targetScore = 12;
    let eventType = 'Normal Activity';
    let notifTitle = '';
    let notifMessage = '';
    let notifType = 'info';

    // Get a random user to apply the simulation to, or the admin user
    let user = db.users[0];
    if (!user) {
      user = {
        _id: `user-${Date.now()}`,
        name: 'Test Subject',
        email: 'test@bdie.io',
        role: 'Analyst',
        department: 'Finance',
        baseline_profile: { activity_level: 'medium' },
        risk_score: 10
      };
      db.users.push(user);
    }

    if (scenario === 'privilege_escalation') {
      targetScore = 85;
      eventType = 'Privilege Escalation Attempt';
      notifTitle = 'High Risk Alert';
      notifMessage = `User ${user.name} attempted to access restricted admin endpoints.`;
      notifType = 'critical';
    } else if (scenario === 'data_hoarding') {
      targetScore = 92;
      eventType = 'Mass File Download';
      notifTitle = 'Critical Data Exfiltration Risk';
      notifMessage = `User ${user.name} downloaded 50GB of sensitive data.`;
      notifType = 'critical';
    } else if (scenario === 'suspicious_logins') {
      targetScore = 78;
      eventType = 'Multiple Failed Logins';
      notifTitle = 'Suspicious Login Activity';
      notifMessage = `Multiple failed login attempts detected for ${user.name} from unknown IPs.`;
      notifType = 'warning';
    } else if (scenario === 'tone_shift') {
      targetScore = 45;
      eventType = 'Communication Tone Shift';
      notifTitle = 'Behavioral Anomaly';
      notifMessage = `Significant negative sentiment shift detected in ${user.name}'s communications.`;
      notifType = 'warning';
    }

    // Update user risk score
    const userIndex = db.users.findIndex((u: any) => u._id === user._id);
    if (userIndex !== -1) {
      db.users[userIndex].risk_score = targetScore;
    }

    // Create activity log
    db.activityLogs.push({
      _id: `log-${Date.now()}`,
      user_id: user._id,
      event_type: eventType,
      anomaly_score: targetScore,
      timestamp: new Date().toISOString()
    });

    // Create notification
    let newNotif = null;
    if (scenario !== 'none') {
      newNotif = {
        _id: `notif-${Date.now()}`,
        user_id: user._id,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        read: false,
        createdAt: new Date().toISOString()
      };
      db.notifications.push(newNotif);
    }

    // Record risk history
    db.riskHistory.push({
      _id: `hist-${Date.now()}`,
      global_risk_score: targetScore,
      trigger_event: eventType,
      timestamp: new Date().toISOString()
    });

    saveDbData(db);

    return NextResponse.json({ 
      success: true, 
      newScore: targetScore,
      notification: newNotif
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
