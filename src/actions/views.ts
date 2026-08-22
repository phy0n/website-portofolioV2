'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function incrementAndGetViews() {
  const filePath = path.join(process.cwd(), 'views.json');
  let views = 0;
  let ips: string[] = [];
  
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'unknown-ip');
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      views = parseInt(parsed.views || '0', 10);
      ips = Array.isArray(parsed.ips) ? parsed.ips : [];
    }
  } catch (e) {
    console.error("Failed to read views.json", e);
  }
  
  let hasUpdated = false;

  if (!ips.includes(ipHash)) {
    ips.push(ipHash);
    views += 1;
    hasUpdated = true;
  }
  
  if (hasUpdated) {
    try {
      fs.writeFileSync(filePath, JSON.stringify({ views, ips }));
    } catch (e) {
      console.error("Failed to write views.json", e);
    }
  }
  
  revalidatePath('/');
  return views;
}
