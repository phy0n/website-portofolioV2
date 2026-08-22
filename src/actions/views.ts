'use server';

import fs from 'fs';
import path from 'path';

export async function incrementAndGetViews() {
  const filePath = path.join(process.cwd(), 'views.json');
  let views = 0;
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      views = parseInt(JSON.parse(data).views || '0', 10);
    }
  } catch (e) {
    console.error("Failed to read views.json", e);
  }
  
  views += 1;
  
  try {
    fs.writeFileSync(filePath, JSON.stringify({ views }));
  } catch (e) {
    console.error("Failed to write views.json", e);
  }
  
  return views;
}
