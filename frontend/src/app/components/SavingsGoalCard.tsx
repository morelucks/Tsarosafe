"use client";
import { useState } from "react";

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

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goalId: string) => void;
  onAddContribution: (goalId: string, amount: number) => void;
}

const SavingsGoalCard = ({ goal, onEdit, onDelete, onAddContribution }: SavingsGoalCardProps) => {
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'vacation': return '✈️';
      case 'education': return '🎓';
      case 'home': return '🏠';
      case 'retirement': return '👴';
      default: return '💰';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-green-100 text-green-800';
      case 'home': return 'bg-purple-100 text-purple-800';
      case 'retirement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddContribution = () => {
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      onAddContribution(goal.id, amount);
      setContributionAmount('');
      setShowAddContribution(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(goal)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
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

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
            {goal.category}
          </span>
          <span className="text-sm text-gray-600">
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Target Date</p>
          <p className="text-sm font-medium">{new Date(goal.deadline).toLocaleDateString()}</p>
        </div>
      </div>

      {showAddContribution ? (
        <div className="flex space-x-2">
          <input
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleAddContribution}
            className="bg-[#0f2a56] text-white px-4 py-2 rounded-md text-sm hover:bg-[#0f2a56]/90"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddContribution(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddContribution(true)}
          className="w-full bg-[#0f2a56] text-white py-2 rounded-md hover:bg-[#0f2a56]/90 transition-colors"
        >
          Add Contribution
        </button>
      )}
    </div>
  );
};

export default SavingsGoalCard;
