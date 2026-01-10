import Link from "next/link";
import { RecentActivity } from "@/types/activity";
import { InlineGDollarAmount } from "@/app/components/GDollarAmount";

interface ActivityFeedProps {
    activities: RecentActivity[];
    limit?: number;
    showViewAll?: boolean;
}

export function ActivityFeed({ activities, limit, showViewAll }: ActivityFeedProps) {
    const displayActivities = limit ? activities.slice(0, limit) : activities;

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return '💰';
            case 'withdrawal':
                return '💸';
            case 'group_join':
                return '👥';
            case 'investment':
                return '📈';
            default:
                return '📋';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const renderAmount = (activity: RecentActivity) => {
        if (activity.tokenType === 1) {
            return (
                <span className="text-sm text-gray-600">
                    <InlineGDollarAmount amount={activity.amount || 0} className="text-gray-900" />
                </span>
            );
        }
        if (activity.amount !== undefined) {
            return (
                <span className="text-sm text-gray-600">
                    ${activity.amount.toLocaleString()}
                </span>
            );
        }
        return null;
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {displayActivities.length > 0 ? displayActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {activity.description}
                            </p>
                            {renderAmount(activity)}
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                    {formatDate(activity.timestamp)}
                                </p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                    {activity.status}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No recent activity. Make a contribution to see it here!
                    </div>
                )}
            </div>
            {showViewAll && displayActivities.length > 0 && (
                <div className="mt-4">
                    <Link
                        href="/transactions" // Pointing to the new transactions page I plan to build
                        className="text-blue-600 text-sm hover:text-blue-800"
                    >
                        View all activity →
                    </Link>
                </div>
            )}
        </div>
    );
}
