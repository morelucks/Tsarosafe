
export interface RecentActivity {
    id: string;
    type: 'deposit' | 'withdrawal' | 'group_join' | 'investment';
    amount?: number;
    tokenType?: number;
    description: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
}
