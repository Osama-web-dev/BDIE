import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.json');

// Default initial data
const defaultData = {
  users: [
    {
      _id: 'admin-1',
      name: 'Admin User',
      email: 'admin@bdie.io',
      role: 'Administrator',
      department: 'Security Operations',
      baseline_profile: { activity_level: 'high' },
      risk_score: 12
    },
    {
      _id: 'user-2',
      name: 'Test Subject',
      email: 'test@bdie.io',
      role: 'Analyst',
      department: 'Finance',
      baseline_profile: { activity_level: 'medium' },
      risk_score: 10
    }
  ],
  activityLogs: [],
  notifications: [],
  riskHistory: []
};

export function getDbData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON DB:', error);
    return defaultData;
  }
}

export function saveDbData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON DB:', error);
    return false;
  }
}
