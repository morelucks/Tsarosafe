"use client";
import { useState, useEffect } from "react";
import SavingsGoalCard from "@/app/components/SavingsGoalCard";
import ProgressChart from "@/app/components/ProgressChart";
import InvestmentPortfolio from "@/app/components/InvestmentPortfolio";

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

interface Investment {
  id: string;
  name: string;
  type: 'defi' | 'stocks' | 'crypto' | 'bonds' | 'real_estate' | 'other';
  amount: number;
  currentValue: number;
  returnRate: number;
  dateInvested: string;
  status: 'active' | 'completed' | 'paused';
}

interface ProgressData {
  date: string;
  totalSavings: number;
  totalInvestments: number;
  activeGoals: number;
  completedGoals: number;
}

export default function InvestPage() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'other' as const
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      const savedGoals = JSON.parse(localStorage.getItem('tsarosafe_savings_goals') || '[]');
      const savedInvestments = JSON.parse(localStorage.getItem('tsarosafe_investments') || '[]');
      const savedProgress = JSON.parse(localStorage.getItem('tsarosafe_progress') || '[]');
      
      setSavingsGoals(savedGoals);
      setInvestments(savedInvestments);
      setProgressData(savedProgress);
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tsarosafe_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('tsarosafe_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('tsarosafe_progress', JSON.stringify(progressData));
  }, [progressData]);

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.deadline) {
      const goal: SavingsGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        description: newGoal.description,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline,
        isActive: true,
        createdAt: new Date().toISOString(),
        category: newGoal.category
      };
      
      setSavingsGoals([...savingsGoals, goal]);
      setNewGoal({
        name: '',
        description: '',
        targetAmount: '',
        deadline: '',
        category: 'other'
      });
      setShowGoalForm(false);
    }
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    // Simple edit - in a real app, you'd have a proper edit form
    const updatedGoals = savingsGoals.map(g => 
      g.id === goal.id ? { ...g, name: prompt('Enter new name:', g.name) || g.name } : g
    );
    setSavingsGoals(updatedGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setSavingsGoals(savingsGoals.filter(g => g.id !== goalId));
    }
  };

  const handleAddContribution = (goalId: string, amount: number) => {
    const updatedGoals = savingsGoals.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    );
    setSavingsGoals(updatedGoals);
  };

  const handleAddInvestment = (investment: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString()
    };
    setInvestments([...investments, newInvestment]);
  };

  const handleUpdateInvestment = (id: string, updates: Partial<Investment>) => {
    const updatedInvestments = investments.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    );
    setInvestments(updatedInvestments);
  };

  const handleRemoveInvestment = (id: string) => {
    if (confirm('Are you sure you want to remove this investment?')) {
      setInvestments(investments.filter(inv => inv.id !== id));
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
          <h1 className="text-3xl font-bold text-gray-900">Investment Navigation</h1>
          <p className="mt-2 text-gray-600">Track your savings goals and investment portfolio</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Savings</p>
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
                  <span className="text-orange-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Investments</p>
                <p className="text-2xl font-semibold text-gray-900">{investments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="mb-8">
          <ProgressChart 
            data={progressData} 
            timeframe={timeframe} 
            onTimeframeChange={setTimeframe} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Savings Goals */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Savings Goals</h2>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90 transition-colors"
              >
                {showGoalForm ? 'Cancel' : 'Add Goal'}
              </button>
            </div>

            {showGoalForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Savings Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                    <input
                      type="text"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="emergency">Emergency</option>
                      <option value="vacation">Vacation</option>
                      <option value="education">Education</option>
                      <option value="home">Home</option>
                      <option value="retirement">Retirement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describe your savings goal..."
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowGoalForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGoal}
                    className="px-4 py-2 bg-[#0f2a56] text-white rounded-md hover:bg-[#0f2a56]/90"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {savingsGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onAddContribution={handleAddContribution}
                />
              ))}

              {savingsGoals.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                  <span className="text-4xl mb-4 block">🎯</span>
                  <p>No savings goals yet</p>
                  <p className="text-sm">Create your first savings goal to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Investment Portfolio */}
          <div>
            <InvestmentPortfolio
              investments={investments}
              onAddInvestment={handleAddInvestment}
              onUpdateInvestment={handleUpdateInvestment}
              onRemoveInvestment={handleRemoveInvestment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
