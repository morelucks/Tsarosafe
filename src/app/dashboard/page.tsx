"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  totalSavings: number;
  activeGroups: number;
  totalInvestments: number;
  monthlyGoal: number;
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'group_join' | 'investment';
  amount?: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSavings: 0,
    activeGroups: 0,
    totalInvestments: 0,
    monthlyGoal: 1000
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 150,
      description: 'Monthly savings deposit',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'group_join',
      description: 'Joined "Family Savings Group"',
      timestamp: '2024-01-14T14:20:00Z',
      status: 'completed'
    },
    {
      id: '3',
      type: 'investment',
      amount: 500,
      description: 'Invested in DeFi yield farming',
      timestamp: '2024-01-13T09:15:00Z',
      status: 'completed'
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [userGroups, setUserGroups] = useState<Array<{
    id: string;
    name: string;
    description: string;
    privacy: string;
    members: Array<{ id: string; addressOrEmail: string; role: string }>;
    goal: { targetAmount: number; cadence: string; startDate: string; endDate?: string };
    invites: Array<{ code: string; addressOrEmail: string; status: string }>;
    createdAt: string;
    createdBy: string;
  }>>([]);

  useEffect(() => {
    // Load user data from localStorage
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Load groups from localStorage
        const storedGroups = JSON.parse(localStorage.getItem('tsarosafe_groups') || '[]');
        setUserGroups(storedGroups);
        
        // Calculate stats from real data
        const totalSavings = storedGroups.reduce((sum: number, group: {
          goal?: { targetAmount?: number };
        }) => 
          sum + (group.goal?.targetAmount || 0), 0
        );
        
        setStats({
          totalSavings: totalSavings || 2450.75, // fallback to mock data
          activeGroups: storedGroups.length || 3,
          totalInvestments: 1200.50, // TODO: implement investment tracking
          monthlyGoal: 1000
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to mock data
        setStats({
          totalSavings: 2450.75,
          activeGroups: 3,
          totalInvestments: 1200.50,
          monthlyGoal: 1000
        });
      }
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const savingsProgress = (stats.totalSavings / stats.monthlyGoal) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here&apos;s your financial overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Savings</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Groups</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Investments</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalInvestments.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Goal</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.monthlyGoal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Savings Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Savings Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Monthly Goal Progress</span>
                  <span>{Math.round(savingsProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>${stats.totalSavings.toLocaleString()}</span>
                  <span>${stats.monthlyGoal.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Link 
                  href="/savings"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  Add Savings
                </Link>
                <Link 
                  href="/create-group"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-center hover:bg-green-700 transition-colors"
                >
                  Create Group
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {activity.amount && (
                      <p className="text-sm text-gray-600">
                        ${activity.amount.toLocaleString()}
                      </p>
                    )}
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
              ))}
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard"
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Your Groups */}
        {userGroups.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="text-gray-500">{group.members.length} members</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        group.privacy === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {group.privacy}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Goal: ${group.goal?.targetAmount?.toLocaleString() || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                href="/savings"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">💰</span>
                <span className="text-sm font-medium text-gray-900">Add Savings</span>
              </Link>
              <Link 
                href="/create-group"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">👥</span>
                <span className="text-sm font-medium text-gray-900">Create Group</span>
              </Link>
              <Link 
                href="/join-group"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">🔍</span>
                <span className="text-sm font-medium text-gray-900">Join Group</span>
              </Link>
              <Link 
                href="/invest"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">📈</span>
                <span className="text-sm font-medium text-gray-900">Invest</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
