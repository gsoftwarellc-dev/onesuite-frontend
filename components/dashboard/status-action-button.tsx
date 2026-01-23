import { CheckCircle, DollarSign, Shield, AlertCircle } from 'lucide-react';

import { CommissionStatus } from '@/services/commissionService';
// Extended roles to match system
type UserRole = 'consultant' | 'manager' | 'finance' | 'director' | 'admin';

interface StatusActionButtonProps {
    currentStatus: CommissionStatus;
    userRole: UserRole;
    onAuthorize?: () => void;
    onApprove?: () => void;
    onMarkPaid?: () => void;
    onReject?: () => void;
    disabled?: boolean;
}

export function StatusActionButton({
    currentStatus,
    userRole,
    onAuthorize,
    onApprove,
    onMarkPaid,
    onReject,
    disabled = false,
}: StatusActionButtonProps) {
    // Finance/Admin can authorize (pending → authorized) and mark as paid (approved → paid)
    // Finance/Admin/Manager can authorize/approve (pending → authorized)
    // Assuming Manager approval moves it to 'authorized' for Director/Finance review
    if (userRole === 'finance' || userRole === 'admin' || userRole === 'manager') {
        if (currentStatus === 'pending') {
            return (
                <div className="flex gap-2">
                    <button
                        onClick={onAuthorize}
                        disabled={disabled}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Shield className="w-4 h-4" />
                        <span>{userRole === 'manager' ? 'Approve' : 'Authorize'}</span>
                    </button>
                    <button
                        onClick={onReject}
                        disabled={disabled}
                        className="bg-white border-2 border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>Reject</span>
                    </button>
                </div>
            );
        }

        if (currentStatus === 'approved') {
            return (
                <button
                    onClick={onMarkPaid}
                    disabled={disabled}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Mark as Paid</span>
                </button>
            );
        }

        return (
            <div className="text-sm text-gray-500 italic">
                {currentStatus === 'authorized' && 'Awaiting Director approval'}
                {currentStatus === 'paid' && 'Completed'}
                {currentStatus === 'rejected' && 'Rejected'}
            </div>
        );
    }

    // Director can approve (authorized → approved)
    if (userRole === 'director') {
        if (currentStatus === 'authorized') {
            return (
                <div className="flex gap-2">
                    <button
                        onClick={onApprove}
                        disabled={disabled}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                    </button>
                    <button
                        onClick={onReject}
                        disabled={disabled}
                        className="bg-white border-2 border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>Reject</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="text-sm text-gray-500 italic">
                {currentStatus === 'pending' && 'Awaiting Finance authorization'}
                {currentStatus === 'approved' && 'Awaiting Finance payment'}
                {currentStatus === 'paid' && 'Completed'}
                {currentStatus === 'rejected' && 'Rejected'}
            </div>
        );
    }

    // Consultants and Managers can only view
    return (
        <div className="text-sm text-gray-500 italic">
            {currentStatus === 'pending' && 'Awaiting Finance review'}
            {currentStatus === 'authorized' && 'Awaiting Director approval'}
            {currentStatus === 'approved' && 'Awaiting payment processing'}
            {currentStatus === 'paid' && 'Payment completed'}
            {currentStatus === 'rejected' && 'Rejected'}
        </div>
    );
}
