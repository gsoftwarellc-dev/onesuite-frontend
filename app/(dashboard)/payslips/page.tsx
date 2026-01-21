"use client";

import { useRouter } from 'next/navigation';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PayslipsPage() {
    const router = useRouter();

    const payslips = [
        { month: 'December 2025', amount: 'S$4,200', status: 'Available', date: '2025-12-31' },
        { month: 'November 2025', amount: 'S$3,800', status: 'Available', date: '2025-11-30' },
        { month: 'October 2025', amount: 'S$4,500', status: 'Available', date: '2025-10-31' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payslips</h1>
                <p className="text-gray-600 mt-2">Download your monthly commission payslips</p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="space-y-4">
                        {payslips.map((payslip, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-[#F4323D] hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#F4323D] bg-opacity-10 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-[#F4323D]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{payslip.month}</h3>
                                        <p className="text-sm text-gray-600">{payslip.amount}</p>
                                        <p className="text-xs text-gray-500 mt-1">Generated on {payslip.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        {payslip.status}
                                    </span>
                                    <Button
                                        variant="default"
                                        className="bg-[#F4323D] hover:bg-[#d62d37]"
                                        onClick={() => router.push('/payslips/2025-12')} // Mock ID for now
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        View & Download
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
