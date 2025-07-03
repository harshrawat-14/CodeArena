import React from 'react';
import Header from '../components/Header';
import IDETab from '../components/IDETab';

const IDEPage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header with higher z-index to ensure dropdown visibility */}
      <div className="relative z-50">
        <Header user={user} onLogout={onLogout} />
      </div>
      
      <div className="relative z-10">
        <IDETab user={user} />
      </div>
    </div>
  );
};

export default IDEPage;
