import { CheckCircle, Circle, ArrowRight, XCircle } from 'lucide-react';

type CommissionStatus = 'pending' | 'authorized' | 'approved' | 'paid' | 'rejected' | 'processing';

interface StatusFlowProps {
    currentStatus: CommissionStatus;
    size?: 'sm' | 'md' | 'lg';
}

export function StatusFlow({ currentStatus, size = 'md' }: StatusFlowProps) {
    const steps = [
        { key: 'pending', label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
        { key: 'authorized', label: 'Authorized', color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { key: 'approved', label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' },
        { key: 'paid', label: 'Paid', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    ];

    const getCurrentStepIndex = () => {
        if (currentStatus === 'rejected') return -1;
        // Map 'processing' to 'approved' visually or handle it separately if needed.
        // For now, let's treat 'processing' similar to 'approved' or update the flow.
        if (currentStatus === 'processing') return 2; // Index of approved

        return steps.findIndex(step => step.key === currentStatus);
    };

    const currentStepIndex = getCurrentStepIndex();

    const getStepStatus = (index: number) => {
        if (currentStatus === 'rejected') return 'rejected';
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'current';
        return 'upcoming';
    };

    if (currentStatus === 'rejected') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">Rejected</span>
            </div>
        );
    }

    const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
    const spacing = size === 'sm' ? 'gap-2' : size === 'md' ? 'gap-3' : 'gap-4';

    return (
        <div className={`flex items-center ${spacing}`}>
            {steps.map((step, index) => {
                const status = getStepStatus(index);

                // Dynamic class construction needs to be safe for Tailwind 
                // We'll use style objects or safe class maps if needed, but here simple should work if classes are standard

                let circleClass = "";
                let textClass = "";

                if (status === 'completed') {
                    circleClass = `${step.bgColor} ${step.color}`;
                    textClass = `${step.color} font-medium`;
                } else if (status === 'current') {
                    const ringColor = step.color.replace('text-', 'ring-');
                    // Tailwind might not pick up dynamic template literals like ring-${color}-600 ideally
                    // relying on safelist or standard classes. 
                    // Let's hardcode for safety for now or assume standard palette.
                    // Simpler: ring-2 ring-offset-2 ring-current (using text color)
                    circleClass = `${step.bgColor} ${step.color} ring-2 ring-offset-2 ring-opacity-50`;
                    textClass = `${step.color} font-medium`;
                } else {
                    circleClass = 'bg-gray-100 text-gray-400';
                    textClass = 'text-gray-400';
                }

                return (
                    <div key={step.key} className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center rounded-full ${circleClass} ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'}`}>
                                {status === 'completed' ? (
                                    <CheckCircle className={iconSize} fill="currentColor" />
                                ) : status === 'current' ? (
                                    <Circle className={iconSize} fill="currentColor" />
                                ) : (
                                    <Circle className={iconSize} />
                                )}
                            </div>
                            <span className={`mt-1 ${textSize} ${textClass}`}>
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <ArrowRight className={`${iconSize} ${status === 'completed' ? 'text-gray-400' : 'text-gray-300'
                                } mb-6`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
