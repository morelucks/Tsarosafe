// ActivityFeed: displays recent on-chain activity for a savings group
import Link from "next/link";
import { RecentActivity } from "@/types/activity";

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
                return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25';
            case 'pending':
                return 'text-amber-400 bg-amber-500/10 border border-amber-500/25';
            case 'failed':
                return 'text-rose-400 bg-rose-500/10 border border-rose-500/25';
            default:
                return 'text-slate-400 bg-slate-500/10 border border-slate-500/25';
        }
    };

    const renderAmount = (activity: RecentActivity) => {
        if (activity.amount !== undefined) {
            return (
                <span className="text-sm font-bold text-white mt-1 block">
                    {activity.amount.toLocaleString('en-US')} CELO
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
        <div className="bg-[#0b0c16]/75 border border-white/5 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-4">
                Recent Activity
            </h2>
            <div className="space-y-4 flex-1">
                {displayActivities.length > 0 ? displayActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-200">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-200 leading-snug">
                                {activity.description}
                            </p>
                            {renderAmount(activity)}
                            <div className="flex items-center justify-between mt-2.5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    {formatDate(activity.timestamp)}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusColor(activity.status)}`}>
                                    {activity.status}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">
                        No recent activity. Make a contribution to see it here!
                    </div>
                )}
            </div>
            {showViewAll && displayActivities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                    <Link
                        href="/transactions"
                        className="text-cyan-400 text-xs font-bold hover:text-cyan-350 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                    >
                        View all activity <span>→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
