import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * EmptyState - Standardized component for empty data views
 * 
 * Usage:
 * <EmptyState
 *   icon={FileText}
 *   title="No commissions found"
 *   description="Submit your first commission to get started"
 *   action={{
 *     label: "Submit Commission",
 *     onClick: () => router.push('/submit-commission')
 *   }}
 * />
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-sm text-gray-600 mb-6 max-w-sm">
                {description}
            </p>

            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
