import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

export interface SiteProfile {
  profileImageUrl: string | null;
}

export async function getSiteProfile(): Promise<SiteProfile> {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return { profileImageUrl: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('site_profile')
      .select('profile_image_url')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      return { profileImageUrl: null };
    }

    const profileImageUrl =
      typeof data?.profile_image_url === 'string' && data.profile_image_url.trim()
        ? data.profile_image_url.trim()
        : null;

    return { profileImageUrl };
  } catch {
    return { profileImageUrl: null };
  }
}
