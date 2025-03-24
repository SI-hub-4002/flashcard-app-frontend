import Link from "next/link";

export default function Header() {
    return (
        <div className="relative bg-white text-gray-700 shadow-md p-4 mb-3 flex items-center justify-end h-20">
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                <span className="text-3xl font-bold">Flash-learn</span>
            </Link>
        </div>
    )
}