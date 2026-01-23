"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Upload,
    Calendar,
    User,
    DollarSign,
    FileText,
    CheckCircle,
    X,
    Bell,
    LogOut,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    Calculator,
    Phone,
    Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commissionService } from '@/services/commissionService';

interface CommissionEntry {
    id: string;
    isExpanded: boolean;

    // Client Information
    clientName: string;
    productType: string;
    paymentDate: string;
    grossRevenue: string;
    sfa: string;
    tiering: string;
    gstPaid: 'yes' | 'no';

    // Referral Section
    referralPercentage: string;
    referralName: string;
    referralContact: string;

    // Additional Claims
    probationIncentive: string;
    otherClaimsRemarks: string;
    otherClaimsAmount: string;
}

const productTypes = [
    'E-Financing',
    'Personal Loan',
    'Moneylender',
    'Server Loan',
    'Copier',
    'Micro Loan',
    'WCL',
    'BTL',
    'Trade',
    'Factoring',
    'Cashout',
    'Property Refi',
    'Private Lending',
];

export default function SubmitCommissionPage() {
    const router = useRouter();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedCount, setSubmittedCount] = useState(0);

    const [entries, setEntries] = useState<CommissionEntry[]>([
        {
            id: '1',
            isExpanded: true,
            clientName: '',
            productType: '',
            paymentDate: '',
            grossRevenue: '',
            sfa: '',
            tiering: '',
            gstPaid: 'no',
            referralPercentage: '',
            referralName: '',
            referralContact: '',
            probationIncentive: '',
            otherClaimsRemarks: '',
            otherClaimsAmount: '',
        },
    ]);

    const addEntry = () => {
        const newEntry: CommissionEntry = {
            id: Date.now().toString(),
            isExpanded: true,
            clientName: '',
            productType: '',
            paymentDate: '',
            grossRevenue: '',
            sfa: '',
            tiering: '',
            gstPaid: 'no',
            referralPercentage: '',
            referralName: '',
            referralContact: '',
            probationIncentive: '',
            otherClaimsRemarks: '',
            otherClaimsAmount: '',
        };

        // Collapse all other entries
        const updatedEntries = entries.map(entry => ({ ...entry, isExpanded: false }));
        setEntries([...updatedEntries, newEntry]);
        toast.success('New entry added');
    };

    const removeEntry = (id: string) => {
        if (entries.length === 1) {
            toast.error('You must have at least one entry');
            return;
        }
        setEntries(entries.filter(entry => entry.id !== id));
        toast.success('Entry removed');
    };

    const toggleExpand = (id: string) => {
        setEntries(entries.map(entry =>
            entry.id === id ? { ...entry, isExpanded: !entry.isExpanded } : entry
        ));
    };

    const updateEntry = (id: string, field: keyof CommissionEntry, value: any) => {
        setEntries(entries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    // Calculate auto-fields for an entry
    const calculateFields = (entry: CommissionEntry) => {
        const grossRevenue = parseFloat(entry.grossRevenue) || 0;
        const sfa = parseFloat(entry.sfa) || 0;
        const tiering = parseFloat(entry.tiering) || 0;
        const referralPercentage = parseFloat(entry.referralPercentage) || 0;
        const probationIncentive = parseFloat(entry.probationIncentive) || 0;
        const otherClaimsAmount = parseFloat(entry.otherClaimsAmount) || 0;

        // Calculate commission base
        const commissionBase = grossRevenue * (sfa / 100) * (tiering / 100);

        // Calculate referral fee
        const referralFee = commissionBase * (referralPercentage / 100);

        // Calculate commission payable (after referral deduction)
        const commissionPayable = commissionBase - referralFee;

        // Fixed handphone allowance
        const handphoneAllowance = 50;

        // Total claims
        const totalClaims = handphoneAllowance + probationIncentive + otherClaimsAmount;

        // Total income payable
        const totalIncomePayable = commissionPayable + totalClaims;

        return {
            referralFee: referralFee.toFixed(2),
            commissionPayable: commissionPayable.toFixed(2),
            handphoneAllowance: handphoneAllowance.toFixed(2),
            totalClaims: totalClaims.toFixed(2),
            totalIncomePayable: totalIncomePayable.toFixed(2),
        };
    };

    const handleSubmit = async () => {
        // Validate all entries
        let hasErrors = false;

        entries.forEach((entry, index) => {
            if (!entry.clientName.trim()) {
                toast.error(`Entry ${index + 1}: Client Name is required`);
                hasErrors = true;
            }
            if (!entry.productType) {
                toast.error(`Entry ${index + 1}: Product Type is required`);
                hasErrors = true;
            }
            if (!entry.paymentDate) {
                toast.error(`Entry ${index + 1}: Payment Date is required`);
                hasErrors = true;
            }
            if (!entry.grossRevenue || parseFloat(entry.grossRevenue) <= 0) {
                toast.error(`Entry ${index + 1}: Gross Revenue is required`);
                hasErrors = true;
            }
            if (!entry.sfa || parseFloat(entry.sfa) <= 0) {
                toast.error(`Entry ${index + 1}: SFA (%) is required`);
                hasErrors = true;
            }
            if (!entry.tiering || parseFloat(entry.tiering) <= 0) {
                toast.error(`Entry ${index + 1}: Tiering (%) is required`);
                hasErrors = true;
            }
        });

        if (hasErrors) {
            return;
        }

        try {
            // Submit all entries sequentially (or parallel depending on preference, sequential is safer for errors)
            let successCount = 0;

            for (const entry of entries) {
                // HTML5 date input already returns YYYY-MM-DD format
                const formattedDate = entry.paymentDate;

                await commissionService.createCommission({
                    clientName: entry.clientName,
                    productType: entry.productType,
                    paymentDate: formattedDate,
                    grossRevenue: parseFloat(entry.grossRevenue),
                    sfa: parseFloat(entry.sfa),
                    tiering: parseFloat(entry.tiering),
                    referralPercentage: entry.referralPercentage ? parseFloat(entry.referralPercentage) : 0,
                    referralName: entry.referralName,
                    probationIncentive: entry.probationIncentive ? parseFloat(entry.probationIncentive) : 0,
                    otherClaimsRemarks: entry.otherClaimsRemarks,
                    otherClaimsAmount: entry.otherClaimsAmount ? parseFloat(entry.otherClaimsAmount) : 0,
                    gstPaid: entry.gstPaid,
                });
                successCount++;
            }

            // Submit successfully
            setSubmittedCount(successCount);
            setIsSubmitted(true);
            toast.success(`${successCount} commission ${successCount === 1 ? 'entry' : 'entries'} submitted successfully`);

        } catch (error: any) {
            console.error("❌ Submission failed:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);
            console.error("Error status:", error.response?.status);

            const msg = error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to submit commission. Please try again.";
            toast.error(msg);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center p-4 min-h-[80vh]">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-3xl mb-4">Submission Successful!</h1>

                    <p className="text-lg text-gray-600 mb-6">
                        Your {submittedCount} commission {submittedCount === 1 ? 'entry has' : 'entries have'} been submitted for review.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg mb-3 text-blue-900">What happens next?</h3>
                        <div className="space-y-2 text-left text-sm text-blue-800">
                            <p>✓ Your manager will review your commission {submittedCount === 1 ? 'entry' : 'entries'}</p>
                            <p>✓ You'll receive a notification once approved</p>
                            <p>✓ Approved commissions will be processed in the next payment cycle</p>
                            <p>✓ You can track the status in your Commission History</p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                setEntries([{
                                    id: Date.now().toString(),
                                    isExpanded: true,
                                    clientName: '',
                                    productType: '',
                                    paymentDate: '',
                                    grossRevenue: '',
                                    sfa: '',
                                    tiering: '',
                                    gstPaid: 'no',
                                    referralPercentage: '',
                                    referralName: '',
                                    referralContact: '',
                                    probationIncentive: '',
                                    otherClaimsRemarks: '',
                                    otherClaimsAmount: '',
                                }]);
                            }}
                            className="bg-[#F4323D] text-white px-8 py-3 rounded-lg hover:bg-[#d62d37] transition-colors"
                        >
                            Submit Another Entry
                        </button>
                        <button
                            onClick={() => router.push('/consultant')}
                            className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl mb-2 font-bold tracking-tight">Submit New Commission</h1>
                <p className="text-gray-600">Fill in the details for each commission entry</p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                    <p className="mb-1"><strong>Multiple Entries Allowed:</strong> You can add multiple commission entries in one submission.</p>
                    <p className="text-blue-700">Click "+ Add Entry" to submit multiple commissions at once. All entries will be reviewed by your manager.</p>
                </div>
            </div>

            {/* Entries */}
            <div className="space-y-4 mb-6">
                {entries.map((entry, index) => {
                    const calculated = calculateFields(entry);

                    return (
                        <div key={entry.id} className="bg-white rounded-lg shadow border border-gray-200">
                            {/* Entry Header */}
                            <div
                                className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleExpand(entry.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#F4323D] bg-opacity-10 rounded-lg flex items-center justify-center text-[#F4323D]">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg">Entry {index + 1}</h3>
                                        {entry.clientName && (
                                            <p className="text-sm text-gray-600">{entry.clientName} • {entry.productType || 'No product type'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {entries.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeEntry(entry.id);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Remove Entry"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button className="p-2">
                                        {entry.isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Entry Content */}
                            {entry.isExpanded && (
                                <div className="p-6 space-y-6">
                                    {/* Client Information Section */}
                                    <div>
                                        <h4 className="text-lg mb-4 flex items-center gap-2 font-medium">
                                            <User className="w-5 h-5 text-[#F4323D]" />
                                            Client Information
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Client Name */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Client Name <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={entry.clientName}
                                                    onChange={(e) => updateEntry(entry.id, 'clientName', e.target.value)}
                                                    placeholder="Enter client name"
                                                />
                                            </div>

                                            {/* Product Type */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Product Type <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={entry.productType}
                                                        onChange={(e) => updateEntry(entry.id, 'productType', e.target.value)}
                                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                                                    >
                                                        <option value="">Select product type</option>
                                                        {productTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Date of Client's Payment */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Date of Client's Payment <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <Input
                                                        type="date"
                                                        value={entry.paymentDate}
                                                        onChange={(e) => updateEntry(entry.id, 'paymentDate', e.target.value)}
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Gross Revenue */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Gross Revenue (S$) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S$</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.grossRevenue}
                                                        onChange={(e) => updateEntry(entry.id, 'grossRevenue', e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* SFA (%) */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    SFA (%) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.sfa}
                                                        onChange={(e) => updateEntry(entry.id, 'sfa', e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Tiering (%) */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Tiering (%) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.tiering}
                                                        onChange={(e) => updateEntry(entry.id, 'tiering', e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* GST Paid by Client */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    GST Paid by Client <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-4 pt-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`gst-${entry.id}`}
                                                            value="yes"
                                                            checked={entry.gstPaid === 'yes'}
                                                            onChange={(e) => updateEntry(entry.id, 'gstPaid', 'yes')}
                                                            className="w-4 h-4 text-[#F4323D] focus:ring-[#F4323D]"
                                                        />
                                                        <span className="text-sm text-gray-700">Yes</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`gst-${entry.id}`}
                                                            value="no"
                                                            checked={entry.gstPaid === 'no'}
                                                            onChange={(e) => updateEntry(entry.id, 'gstPaid', 'no')}
                                                            className="w-4 h-4 text-[#F4323D] focus:ring-[#F4323D]"
                                                        />
                                                        <span className="text-sm text-gray-700">No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Referral Section */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="text-lg mb-4 flex items-center gap-2 font-medium">
                                            <User className="w-5 h-5 text-[#F4323D]" />
                                            Referral Information
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Referral (%) */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Referral (%)
                                                </label>
                                                <div className="relative">
                                                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.referralPercentage}
                                                        onChange={(e) => updateEntry(entry.id, 'referralPercentage', e.target.value)}
                                                        placeholder="0.00 (If blank → 0%)"
                                                        className="pl-9"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Leave blank for 0%</p>
                                            </div>

                                            {/* Referral Name */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Referral Name
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={entry.referralName}
                                                    onChange={(e) => updateEntry(entry.id, 'referralName', e.target.value)}
                                                    placeholder="Enter referral name (If blank → Nil)"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Leave blank for &quot;Nil&quot;</p>
                                            </div>

                                            {/* Referral Contact Number */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Referral Contact Number
                                                </label>
                                                <div className="relative">
                                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <Input
                                                        type="text"
                                                        value={entry.referralContact}
                                                        onChange={(e) => updateEntry(entry.id, 'referralContact', e.target.value)}
                                                        placeholder="Enter contact (If blank → Nil)"
                                                        className="pl-9"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Leave blank for &quot;Nil&quot;</p>
                                            </div>
                                        </div>

                                        {/* Auto-calculated: Referral Fee & Commission Payable */}
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calculator className="w-4 h-4 text-gray-500" />
                                                    <label className="text-sm text-gray-600">Referral Fee (Auto-calculated)</label>
                                                </div>
                                                <p className="text-xl">S$ {calculated.referralFee}</p>
                                            </div>

                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calculator className="w-4 h-4 text-blue-600" />
                                                    <label className="text-sm text-blue-700">Commission Payable (Auto-calculated)</label>
                                                </div>
                                                <p className="text-xl text-blue-900">S$ {calculated.commissionPayable}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Claims Section */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="text-lg mb-4 flex items-center gap-2 font-medium">
                                            <DollarSign className="w-5 h-5 text-[#F4323D]" />
                                            Additional Claims
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {/* Handphone Allowance - Fixed */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Handphone Allowance
                                                </label>
                                                <div className="bg-gray-100 px-4 py-2 border border-input rounded-md text-gray-600 text-sm">
                                                    S$ 50.00 (Fixed)
                                                </div>
                                            </div>

                                            {/* Probation Incentive - Editable */}
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Probation Incentive (S$)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S$</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.probationIncentive}
                                                        onChange={(e) => updateEntry(entry.id, 'probationIncentive', e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Other Claims */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Other Claims - Remarks
                                                </label>
                                                <textarea
                                                    value={entry.otherClaimsRemarks}
                                                    onChange={(e) => updateEntry(entry.id, 'otherClaimsRemarks', e.target.value)}
                                                    placeholder="Enter remarks for other claims"
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm mb-2 text-gray-700">
                                                    Other Claims - Amount (S$)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S$</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={entry.otherClaimsAmount}
                                                        onChange={(e) => updateEntry(entry.id, 'otherClaimsAmount', e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total Income Payable */}
                                        <div className="mt-6 bg-green-50 p-6 rounded-lg border-2 border-green-300">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Calculator className="w-5 h-5 text-green-600" />
                                                        <label className="text-lg text-green-800 font-medium">Total Income Payable</label>
                                                    </div>
                                                    <p className="text-sm text-green-700">Commission + Claims (Handphone + Probation + Other)</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl text-green-900 font-bold">S$ {calculated.totalIncomePayable}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Entry Button */}
            <div className="mb-6">
                <button
                    onClick={addEntry}
                    className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:border-[#F4323D] hover:text-[#F4323D] transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Entry</span>
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-[#F4323D] hover:bg-[#d62d37] text-white h-14 text-lg"
                >
                    <Upload className="w-5 h-5 mr-2" />
                    <span>Submit {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}</span>
                </Button>
                <Button
                    onClick={() => router.push('/consultant')}
                    variant="outline"
                    className="h-14 px-8 border-gray-300"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
