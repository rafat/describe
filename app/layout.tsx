// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/context/Web3Provider';
import Navbar from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Web3 Blog',
    description: 'A decentralized blogging platform',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Web3Provider>
                    <Navbar />
                    <main className="container mx-auto p-4">{children}</main>
                </Web3Provider>
            </body>
        </html>
    );
}