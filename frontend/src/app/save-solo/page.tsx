"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SoloSavings {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  category: 'emergency' | 'vacation' | 'education' | 'home' | 'retirement' | 'other';
}

export default function SaveSoloPage() {
  const [soloSavings, setSoloSavings] = useState<SoloSavings[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'other' as SoloSavings['category']
  });
  const [showAddAmount, setShowAddAmount] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('tsarosafe_solo_savings') || '[]');
    setSoloSavings(saved);
  }, []);

  const handleCreateGoal = () => {
    if (formData.name && formData.targetAmount && formData.deadline) {
      const newGoal: SoloSavings = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0,
        deadline: formData.deadline,
        createdAt: new Date().toISOString(),
        category: formData.category
      };
      const updated = [...soloSavings, newGoal];
      setSoloSavings(updated);
      localStorage.setItem('tsarosafe_solo_savings', JSON.stringify(updated));
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        deadline: '',
        category: 'other'
      });
      setShowAddForm(false);
    }
  };

  const handleAddAmount = (goalId: string) => {
    if (addAmount && parseFloat(addAmount) > 0) {
      const updated = soloSavings.map(goal =>
        goal.id === goalId
          ? { ...goal, currentAmount: goal.currentAmount + parseFloat(addAmount) }
          : goal
      );
      setSoloSavings(updated);
      localStorage.setItem('tsarosafe_solo_savings', JSON.stringify(updated));
      setAddAmount('');
      setShowAddAmount(null);
    }
  };

  const totalSaved = soloSavings.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = soloSavings.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const activeGoals = soloSavings.length;
  const completedGoals = soloSavings.filter(goal => goal.currentAmount >= goal.targetAmount).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Save Solo</h1>
          <p className="mt-2 text-gray-600">Save individually and reach your personal financial goals</p>
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
                <p className="text-2xl font-semibold text-gray-900">${totalSaved.toLocaleString()}</p>
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
                  {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Goal */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Savings Goal</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90 transition-colors"
            >
              {showAddForm ? 'Cancel' : '+ New Goal'}
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your savings goal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SoloSavings['category'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="vacation">Vacation</option>
                    <option value="education">Education</option>
                    <option value="home">Home</option>
                    <option value="retirement">Retirement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateGoal}
                className="w-full bg-[#0f2a56] text-white px-6 py-2 rounded-md hover:bg-[#0f2a56]/90"
              >
                Create Goal
              </button>
            </div>
          )}
        </div>

        {/* Savings Goals List */}
        {soloSavings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No savings goals yet</h3>
            <p className="text-gray-600 mb-6">Create your first solo savings goal to start saving individually</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#0f2a56] text-white px-6 py-2 rounded-md hover:bg-[#0f2a56]/90"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soloSavings.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              
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
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-[#0f2a56]'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>${goal.currentAmount.toLocaleString()}</span>
                      <span>${goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}</span>
                    <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>

                  {showAddAmount === goal.id ? (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => handleAddAmount(goal.id)}
                        className="bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90 text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddAmount(null);
                          setAddAmount('');
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddAmount(goal.id)}
                      className="w-full bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90"
                    >
                      Add Savings
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Why Save Solo?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Save at your own pace without group commitments</li>
            <li>Set personal goals tailored to your needs</li>
            <li>Track your progress independently</li>
            <li>No pressure from group deadlines</li>
          </ul>
          <div className="mt-4">
            <Link
              href="/create-group"
              className="text-[#0f2a56] hover:underline font-medium"
            >
              Or join a group savings plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

