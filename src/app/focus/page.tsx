import type { Metadata } from 'next';
import FocusClock from './FocusClock';

export const metadata: Metadata = {
  title: 'Focus • Time',
  description: 'Minimalist focus clock.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FocusPage() {
  return <FocusClock />;
}

