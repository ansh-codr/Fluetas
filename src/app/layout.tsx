import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { ToastProvider } from '@/context/ToastContext';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FLUETAS — Your Body. Your Data. Your Formula.',
  description:
    'FLUETAS is a personal health & wellness platform that tracks workouts, nutrition, hydration, sleep, and connects you with expert consultations — all in one place.',
  keywords: ['health', 'wellness', 'fitness', 'nutrition', 'sleep', 'consultation', 'workout', 'AI coach'],
  icons: {
    icon: '/assets/image.png',
    apple: '/assets/image.png',
  },
  openGraph: {
    title: 'FLUETAS — Your Body. Your Data. Your Formula.',
    description: 'One platform for training, wellness, AI guidance and expert consultations.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ fontFamily: 'var(--font-sans)' }}>
        <AuthProvider>
          <UserProfileProvider>
            <ToastProvider>
              {children}
              <FeedbackWidget />
            </ToastProvider>
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
