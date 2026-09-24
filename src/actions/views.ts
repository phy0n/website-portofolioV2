'use server';

import { headers } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) 
  : null;

export async function incrementAndGetViews() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfIp = headersList.get('cf-connecting-ip');
  
  const ip = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || 'unknown-ip'));
  const userAgent = headersList.get('user-agent') || 'unknown-ua';
  
  // Combine IP and User-Agent to create a more unique identifier
  const identifier = `${ip}-${userAgent}`;
  const ipHash = crypto.createHash('sha256').update(identifier).digest('hex');
  const path = '/portfolio-views';

  // Base views to keep the existing count from views.json
  const baseViews = 16; 

  if (!supabase) {
    return baseViews; // Fallback if Supabase is not configured
  }

  try {
    // Insert new view event for every visit (like blog views)
    await supabase.from('analytics_events').insert({
      visitor_id: ipHash, 
      ip_hash: ipHash,
      path: path,
      user_agent: userAgent
    });

    // Get total views for this path
    const { count } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('path', path);

    return (count || 0) + baseViews;
  } catch (e) {
    console.error("Failed to update Supabase views", e);
    return baseViews;
  }
}
