'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Download,
    Printer,
    ArrowLeft,
    Calendar,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PayslipDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [selectedMonth, setSelectedMonth] = useState(params.id || '2025-12');

    // UNCOMMENT when logo is available or use a placeholder
    // const logo = '/logo.png'; 

    // NOTE: This is a UI template. Backend payslip API not yet implemented.
    // When implemented, fetch data based on params.id from /api/payslips/{id}
    const payslipData = {
        payPeriod: 'December 2025',
        payDate: '05 January 2026',
        issueDate: '2026-01-05',
        consultant: {
            salesId: 'EMP-001',
            name: 'Emily Zhang',
            contactNumber: '+65 9123 4567',
            dateOfJoin: '15 March 2023',
            currentRank: 'Senior Consultant',
            team: 'Enterprise Sales',
        },
        breakdown: {
            baseCommission: 5200.00,
            overridingCommission: 1350.00,
            claims: 450.00,
        },
    };

    const totalIncomePayable =
        payslipData.breakdown.baseCommission +
        payslipData.breakdown.overridingCommission +
        payslipData.breakdown.claims;

    const handleDownloadPDF = () => {
        window.print();
    };

    const handlePrint = () => {
        window.print();
    };

    const availablePayslips = [
        { value: '2025-12', label: 'December 2025' },
        { value: '2025-11', label: 'November 2025' },
        { value: '2025-10', label: 'October 2025' },
        { value: '2025-09', label: 'September 2025' },
        { value: '2025-08', label: 'August 2025' },
        { value: '2025-07', label: 'July 2025' },
    ];

    return (
        <div className="min-h-screen bg-[#F4F4F4]">
            {/* Action Bar - Hidden when printing */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/payslips"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to List</span>
                        </Link>

                        <div className="h-6 w-px bg-gray-300"></div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => router.push(`/payslips/${e.target.value}`)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4323D] text-sm"
                            >
                                {availablePayslips.map((payslip) => (
                                    <option key={payslip.value} value={payslip.value}>
                                        {payslip.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print</span>
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 bg-[#F4323D] text-white rounded-lg hover:bg-[#d62d37] transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Payslip Document */}
            <div className="p-6 print:p-0">
                <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
                    {/* Document Header */}
                    <div className="border-b-4 border-[#F4323D] p-10 print:p-12">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-start gap-4">
                                {/* <img src={logo} alt="One Suite Advisory" className="h-16 w-16" /> */}
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Logo</div>
                                <div>
                                    <h1 className="text-2xl mb-2 text-gray-900">One Suite Advisory Pte Ltd</h1>
                                    <p className="text-sm text-gray-600 mb-0.5">123 Robinson Road, #15-01</p>
                                    <p className="text-sm text-gray-600 mb-0.5">Singapore 068898</p>
                                    <p className="text-sm text-gray-600 mb-0.5">Tel: +65 6123 4567</p>
                                    <p className="text-sm text-gray-600">UEN: 202012345A</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-block bg-[#F4323D] text-white px-6 py-3 rounded-lg">
                                    <p className="text-lg uppercase tracking-wider">Payslip</p>
                                </div>
                                <p className="text-sm text-gray-600 mt-4">
                                    <strong>Document No:</strong> PS-{payslipData.consultant.salesId}-
                                    {selectedMonth.replace('-', '')}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <strong>Issue Date:</strong> {payslipData.issueDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pay Period Bar */}
                    <div className="px-10 py-6 print:px-12 print:py-6 bg-gray-100 border-b-2 border-gray-300">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Pay Period</p>
                                <p className="text-3xl text-gray-900">{payslipData.payPeriod}</p>
                            </div>
                        </div>
                    </div>

                    {/* Consultant Information */}
                    <div className="p-10 print:p-12">
                        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-6 pb-2 border-b-2 border-gray-300">
                            Consultant Information
                        </h2>

                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10">
                            <div className="flex">
                                <span className="text-sm text-gray-600 w-40">Consultant Name:</span>
                                <span className="text-sm text-gray-900 font-medium">{payslipData.consultant.name}</span>
                            </div>
                            <div className="flex">
                                <span className="text-sm text-gray-600 w-40">Contact Number:</span>
                                <span className="text-sm text-gray-900">{payslipData.consultant.contactNumber}</span>
                            </div>
                            <div className="flex">
                                <span className="text-sm text-gray-600 w-40">Date of Join:</span>
                                <span className="text-sm text-gray-900">{payslipData.consultant.dateOfJoin}</span>
                            </div>
                            <div className="flex">
                                <span className="text-sm text-gray-600 w-40">Current Rank:</span>
                                <span className="text-sm text-gray-900 font-medium">{payslipData.consultant.currentRank}</span>
                            </div>
                            <div className="flex">
                                <span className="text-sm text-gray-600 w-40">Employee ID:</span>
                                <span className="text-sm text-gray-900">{payslipData.consultant.salesId}</span>
                            </div>
                            <div className="flex">
                                <span className="text-sm text-gray-600 w-40">Team:</span>
                                <span className="text-sm text-gray-900">{payslipData.consultant.team}</span>
                            </div>
                        </div>

                        {/* Income Breakdown */}
                        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-6 pb-2 border-b-2 border-gray-300">
                            Income Breakdown
                        </h2>

                        <div className="space-y-4">
                            {/* Base Commission */}
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-900 font-medium">Base Commission</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Direct sales commissions earned</p>
                                </div>
                                <p className="text-base text-gray-900 tabular-nums font-medium">
                                    S$ {payslipData.breakdown.baseCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Overriding Commission */}
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-900 font-medium">Overriding Commission</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Management and team bonuses</p>
                                </div>
                                <p className="text-base text-gray-900 tabular-nums font-medium">
                                    S$ {payslipData.breakdown.overridingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Claims */}
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-900 font-medium">Claims</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Approved expense claims</p>
                                </div>
                                <p className="text-base text-gray-900 tabular-nums font-medium">
                                    S$ {payslipData.breakdown.claims.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Total Income Payable */}
                            <div className="flex justify-between items-center py-5 border-t-4 border-[#F4323D] mt-6">
                                <div>
                                    <p className="text-lg text-gray-900 font-bold">Total Income Payable</p>
                                    <p className="text-xs text-gray-500 mt-1">Total amount to be paid</p>
                                </div>
                                <p className="text-3xl text-[#F4323D] tabular-nums font-bold">
                                    S$ {totalIncomePayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mt-10 bg-green-50 border-2 border-green-200 rounded-lg p-5 flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-base text-green-900 font-medium mb-2">
                                    Payment Status: Completed
                                </p>
                                <p className="text-sm text-green-700">
                                    Payment of <strong>S$ {totalIncomePayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been successfully transferred to your registered bank account on <strong>{payslipData.payDate}</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Summary Table */}
                        <div className="mt-10 border-2 border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <h3 className="text-sm uppercase tracking-wider text-gray-700 font-medium">
                                    Payment Summary
                                </h3>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 text-sm text-gray-700">Base Commission</td>
                                            <td className="py-3 text-sm text-gray-900 text-right tabular-nums">
                                                S$ {payslipData.breakdown.baseCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 text-sm text-gray-700">Overriding Commission</td>
                                            <td className="py-3 text-sm text-gray-900 text-right tabular-nums">
                                                S$ {payslipData.breakdown.overridingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 text-sm text-gray-700">Claims</td>
                                            <td className="py-3 text-sm text-gray-900 text-right tabular-nums">
                                                S$ {payslipData.breakdown.claims.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="py-4 text-base text-gray-900 font-bold">
                                                Total Income Payable
                                            </td>
                                            <td className="py-4 text-lg text-[#F4323D] text-right tabular-nums font-bold">
                                                S$ {totalIncomePayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-10 py-8 print:px-12 print:py-10 border-t-2 border-gray-200 bg-gray-50">
                        <div className="space-y-4">
                            <p className="text-xs text-gray-700 font-medium uppercase tracking-wider">
                                Important Notes:
                            </p>
                            <ul className="text-xs text-gray-600 space-y-2 ml-4 leading-relaxed">
                                <li>
                                    • This is a computer-generated document and does not require a signature.
                                </li>
                                <li>
                                    • Please verify all details carefully. Report any discrepancies to HR within 7 days of receipt.
                                </li>
                                <li>
                                    • All commissions are calculated based on approved contracts and company commission structure.
                                </li>
                                <li>
                                    • For any inquiries regarding this payslip, please contact HR at hr@onesuiteadvisory.com or call +65 6123 4567.
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                            <p className="text-xs text-gray-500">
                                One Suite Advisory Pte Ltd • 123 Robinson Road, #15-01, Singapore 068898
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Tel: +65 6123 4567 • Email: info@onesuiteadvisory.com • UEN: 202012345A
                            </p>
                            <p className="text-xs text-gray-400 mt-4">
                                This document is confidential and intended for the addressee only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom margin for print */}
            <div className="h-12 print:hidden"></div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
        </div>
    );
}
