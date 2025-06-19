// app/components/Navbar.tsx
import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white text-2xl font-bold">
                    DeScribe
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href="/posts/create" className="text-gray-300 hover:text-white">
                        Create Post
                    </Link>
                    <ConnectWallet />
                </div>
            </div>
        </nav>
    );
}