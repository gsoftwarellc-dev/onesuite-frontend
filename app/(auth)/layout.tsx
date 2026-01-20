export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid items-center justify-center bg-gray-50">
            {children}
        </div>
    );
}
