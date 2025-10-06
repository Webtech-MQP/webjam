import '@/styles/globals.css';

import { type Metadata } from 'next';
import { Overpass, Poppins } from 'next/font/google';

import { AuthProvider } from '@/features/auth/components/auth-provider';
import { TRPCReactProvider } from '@/trpc/react';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
    title: 'webjam',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const poppins = Poppins({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-poppins',
});

const overpass = Overpass({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-overpass',
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            suppressHydrationWarning
            lang="en"
            className={`${poppins.className} ${overpass.variable}`}
        >
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <TRPCReactProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </TRPCReactProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
