import QuoteManager from './QuoteManager';
import { createQuote, updateQuote, deleteQuote } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Quote {
  id: string;
  date: string;
  text: string;
  author: string | null;
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .order('date', { ascending: false });

  const quoteRows = (quotes as Quote[] | null) ?? [];
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : undefined;
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : undefined;

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
