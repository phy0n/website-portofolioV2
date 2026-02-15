'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';

const redirectWithError = (message: string) => {
  redirect(`/blog?error=${encodeURIComponent(message)}`);
};

const redirectWithSuccess = (message: string) => {
  redirect(`/blog?success=${encodeURIComponent(message)}`);
};

const todayDateString = () => {
  return new Date().toISOString().slice(0, 10);
};

export async function createQuote(formData: FormData) {
  const date = String(formData.get('date') || '').trim() || todayDateString();
  const text = String(formData.get('text') || '').trim();
  const author = String(formData.get('author') || '').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!text) {
    redirectWithError('Quote text is required.');
  }

  if (!showOnMain && !showOnPhion) {
    redirectWithError('Pick at least one site (Main/Phion).');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('quotes').insert({
    date,
    text,
    author: author || null,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(`Create quote failed: ${error.message}`);
  }

  revalidatePath('/blog');
  redirectWithSuccess('Quote created.');
}

export async function deleteQuote(formData: FormData) {
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError('Missing quote id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('quotes').delete().eq('id', id);

  if (error) {
    redirectWithError(`Delete quote failed: ${error.message}`);
  }

  revalidatePath('/blog');
  redirectWithSuccess('Quote deleted.');
}

