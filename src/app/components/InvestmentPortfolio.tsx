"use client";
import { useState } from "react";

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

interface InvestmentPortfolioProps {
  investments: Investment[];
  onAddInvestment: (investment: Omit<Investment, 'id'>) => void;
  onUpdateInvestment: (id: string, investment: Partial<Investment>) => void;
  onRemoveInvestment: (id: string) => void;
}

const InvestmentPortfolio = ({ 
  investments, 
  onAddInvestment, 
  onUpdateInvestment, 
  onRemoveInvestment 
}: InvestmentPortfolioProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'defi' as const,
    amount: '',
    currentValue: '',
    returnRate: '',
    dateInvested: new Date().toISOString().split('T')[0],
    status: 'active' as const
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'defi': return '🔄';
      case 'stocks': return '📈';
      case 'crypto': return '₿';
      case 'bonds': return '📋';
      case 'real_estate': return '🏠';
      default: return '💰';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'defi': return 'bg-blue-100 text-blue-800';
      case 'stocks': return 'bg-green-100 text-green-800';
      case 'crypto': return 'bg-orange-100 text-orange-800';
      case 'bonds': return 'bg-purple-100 text-purple-800';
      case 'real_estate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnRate = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const handleAddInvestment = () => {
    if (newInvestment.name && newInvestment.amount && newInvestment.currentValue) {
      onAddInvestment({
        ...newInvestment,
        amount: parseFloat(newInvestment.amount),
        currentValue: parseFloat(newInvestment.currentValue),
        returnRate: parseFloat(newInvestment.returnRate) || 0
      });
      setNewInvestment({
        name: '',
        type: 'defi',
        amount: '',
        currentValue: '',
        returnRate: '',
        dateInvested: new Date().toISOString().split('T')[0],
        status: 'active'
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Investment Portfolio</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#0f2a56] text-white px-4 py-2 rounded-md hover:bg-[#0f2a56]/90 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Invested</p>
          <p className="text-xl font-bold text-gray-900">${totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Current Value</p>
          <p className="text-xl font-bold text-gray-900">${totalCurrentValue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Return</p>
          <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalReturn.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Return Rate</p>
          <p className={`text-xl font-bold ${totalReturnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturnRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Add Investment Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Investment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Investment name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newInvestment.type}
                onChange={(e) => setNewInvestment({...newInvestment, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="defi">DeFi</option>
                <option value="stocks">Stocks</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="bonds">Bonds</option>
                <option value="real_estate">Real Estate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Invested</label>
              <input
                type="number"
                value={newInvestment.amount}
                onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <input
                type="number"
                value={newInvestment.currentValue}
                onChange={(e) => setNewInvestment({...newInvestment, currentValue: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Rate (%)</label>
              <input
                type="number"
                value={newInvestment.returnRate}
                onChange={(e) => setNewInvestment({...newInvestment, returnRate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Invested</label>
              <input
                type="date"
                value={newInvestment.dateInvested}
                onChange={(e) => setNewInvestment({...newInvestment, dateInvested: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddInvestment}
              className="px-4 py-2 bg-[#0f2a56] text-white rounded-md hover:bg-[#0f2a56]/90"
            >
              Add Investment
            </button>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="space-y-4">
        {investments.map((investment) => (
          <div key={investment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(investment.type)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{investment.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(investment.type)}`}>
                      {investment.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                      {investment.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdateInvestment(investment.id, { 
                    status: investment.status === 'active' ? 'paused' : 'active' 
                  })}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {investment.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => onRemoveInvestment(investment.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Invested</p>
                <p className="font-semibold text-gray-900">${investment.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="font-semibold text-gray-900">${investment.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Return</p>
                <p className={`font-semibold ${investment.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {investment.returnRate >= 0 ? '+' : ''}{investment.returnRate.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(investment.dateInvested).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {investments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📈</span>
            <p>No investments yet</p>
            <p className="text-sm">Add your first investment to start tracking your portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentPortfolio;
