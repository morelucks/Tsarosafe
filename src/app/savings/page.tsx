"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SavingsGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isActive: boolean;
  createdAt: string;
  category: 'emergency' | 'vacation' | 'education' | 'home' | 'retirement' | 'other';
}

export default function SavingsPage() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');

  useEffect(() => {
    const savedGoals = JSON.parse(localStorage.getItem('tsarosafe_savings_goals') || '[]');
    setSavingsGoals(savedGoals);
  }, []);

  const handleQuickAdd = () => {
    if (quickAmount && savingsGoals.length > 0) {
      const amount = parseFloat(quickAmount);
      if (amount > 0) {
        // Add to the first active goal
        const activeGoal = savingsGoals.find(goal => goal.isActive);
        if (activeGoal) {
          const updatedGoals = savingsGoals.map(goal => 
            goal.id === activeGoal.id 
              ? { ...goal, currentAmount: goal.currentAmount + amount }
              : goal
          );
          setSavingsGoals(updatedGoals);
          localStorage.setItem('tsarosafe_savings_goals', JSON.stringify(updatedGoals));
          setQuickAmount('');
          setShowQuickAdd(false);
        }
      }
    }
  };

  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const activeGoals = savingsGoals.filter(goal => goal.isActive).length;
  const completedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Savings Dashboard</h1>
          <p className="mt-2 text-gray-600">Track and manage your savings goals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Saved</p>
                <p className="text-2xl font-semibold text-gray-900">${totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Goals</p>
                <p className="text-2xl font-semibold text-gray-900">{activeGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Savings */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Add Savings</h2>
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90 transition-colors"
            >
              {showQuickAdd ? 'Cancel' : 'Add Savings'}
            </button>
          </div>

          {showQuickAdd && (
            <div className="flex space-x-4">
              <input
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleQuickAdd}
                className="bg-[#0f2a56] text-white px-6 py-2 rounded-md hover:bg-[#0f2a56]/90"
              >
                Add
              </button>
            </div>
          )}

          {savingsGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">🎯</span>
              <p>No savings goals yet</p>
              <p className="text-sm mb-4">Create your first savings goal to start tracking</p>
              <Link 
                href="/invest"
                className="bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90"
              >
                Create Goal
              </Link>
            </div>
          )}
        </div>

        {/* Savings Goals Overview */}
        {savingsGoals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={goal.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.category === 'emergency' ? 'bg-red-100 text-red-800' :
                      goal.category === 'vacation' ? 'bg-blue-100 text-blue-800' :
                      goal.category === 'education' ? 'bg-green-100 text-green-800' :
                      goal.category === 'home' ? 'bg-purple-100 text-purple-800' :
                      goal.category === 'retirement' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.category}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#0f2a56] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>${goal.currentAmount.toLocaleString()}</span>
                      <span>${goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}</span>
                    <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/invest"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <span className="text-4xl mb-4 block">🎯</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Goals</h3>
            <p className="text-gray-600">Create and track your savings goals</p>
          </Link>

          <Link 
            href="/invest"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <span className="text-4xl mb-4 block">📈</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Portfolio</h3>
            <p className="text-gray-600">Track your investments and returns</p>
          </Link>

          <Link 
            href="/create-group"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <span className="text-4xl mb-4 block">👥</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Savings</h3>
            <p className="text-gray-600">Join or create savings groups</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
