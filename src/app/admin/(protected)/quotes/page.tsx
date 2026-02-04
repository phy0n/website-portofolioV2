import QuoteManager from './QuoteManager';
import { createQuote, updateQuote, deleteQuote } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Quote {
  id: string;
  date: string;
  text: string;
  author: string | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const { supabase } = await requireAdmin();
  const safeDecode = (value?: string) => {
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .order('date', { ascending: false });

  const quoteRows = (quotes as Quote[] | null) ?? [];
  const successMessage = safeDecode(searchParams?.success);
  const errorMessage = safeDecode(searchParams?.error);

  return (
    <QuoteManager
      quotes={quoteRows}
      createQuote={createQuote}
      updateQuote={updateQuote}
      deleteQuote={deleteQuote}
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
}
