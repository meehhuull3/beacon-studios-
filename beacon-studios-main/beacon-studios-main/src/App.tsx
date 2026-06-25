import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AppShell from './components/AppShell';
import BIDashboard from './components/BIDashboard';
import CollegeDashboard from './components/CollegeDashboard';
import CollegesPage from './components/CollegesPage';
import CohortsPage from './components/CohortsPage';
import StartupsPage from './components/StartupsPage';
import EventsPage from './components/EventsPage';
import MessagesPage from './components/MessagesPage';
import TasksPage from './components/TasksPage';
import DocumentsPage from './components/DocumentsPage';
import AnalyticsPage from './components/AnalyticsPage';
import BroadcastModal from './components/BroadcastModal';

import { User, Message } from './types';
import { dbService } from './supabaseClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [refetchCounter, setRefetchCounter] = useState<number>(0);

  // Quick Action triggered from topbar button click
  const [showAddEventDirectly, setShowAddEventDirectly] = useState(false);
  const [showAddTaskDirectly, setShowAddTaskDirectly] = useState(false);
  const [showBroadcastDirectly, setShowBroadcastDirectly] = useState(false);

  // Counter of unread messages globally to display nice badges
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Retrieve auth session from localStorage if already logged in previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('beacon_session_email');
    if (savedEmail) {
      dbService.getUserByEmail(savedEmail).then(user => {
        if (user) {
          setCurrentUser(user);
          setCurrentPage(user.portal === 'bi' ? 'dashboard' : 'c-dashboard');
        }
      });
    }
  }, []);

  // Sync and count unread messages mock real-time
  useEffect(() => {
    if (!currentUser) return;

    const countUnread = async () => {
      // Find relative conversations
      const convs = await dbService.getConversations();
      const currentPortalConvs = currentUser.portal === 'bi' 
        ? convs 
        : convs.filter(c => c.college_id === currentUser.college_id);

      let totalCount = 0;
      for (const c of currentPortalConvs) {
        const msgs = await dbService.getMessages(c.id);
        // Emulate some messages unread for nice badges
        if (msgs.length > 0) {
          totalCount += 1; // 1 unread message notification mock
        }
      }
      setUnreadMessagesCount(totalCount);
    };

    countUnread();
    const interval = setInterval(countUnread, 8000);
    return () => clearInterval(interval);
  }, [currentUser, refetchCounter]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('beacon_session_email', user.email);
    setCurrentPage(user.portal === 'bi' ? 'dashboard' : 'c-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('beacon_session_email');
  };

  const triggerRefetch = () => {
    setRefetchCounter(prev => prev + 1);
  };

  const handleCreateTrigger = (type: 'event' | 'task' | 'startup' | 'college' | 'cohort' | 'document' | 'broadcast') => {
    if (type === 'event') {
      setShowAddEventDirectly(true);
    } else if (type === 'task') {
      setShowAddTaskDirectly(true);
    } else if (type === 'broadcast') {
      setShowBroadcastDirectly(true);
    }
  };

  const handleMessagesRead = () => {
    setUnreadMessagesCount(0);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <AppShell 
      user={currentUser} 
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onCreateTrigger={handleCreateTrigger}
      unreadMessagesCount={unreadMessagesCount}
    >
      {/* Dynamic Main Workspace Routing Page Selector */}
      {currentPage === 'dashboard' && (
        <BIDashboard onNavigate={setCurrentPage} refetchCounter={refetchCounter} />
      )}
      
      {currentPage === 'c-dashboard' && (
        <CollegeDashboard user={currentUser} onNavigate={setCurrentPage} refetchCounter={refetchCounter} />
      )}

      {currentPage === 'colleges' && (
        <CollegesPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} />
      )}

      {currentPage === 'cohorts' && (
        <CohortsPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} />
      )}

      {currentPage === 'startups' && (
        <StartupsPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} currentUser={currentUser} />
      )}
      
      {currentPage === 'c-startups' && (
        <StartupsPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} currentUser={currentUser} />
      )}

      {currentPage === 'events' && (
        <EventsPage 
          onRefetch={triggerRefetch} 
          refetchCounter={refetchCounter} 
          currentUser={currentUser}
          showAddDirectly={showAddEventDirectly}
          onModalHandled={() => setShowAddEventDirectly(false)}
        />
      )}

      {currentPage === 'c-events' && (
        <EventsPage 
          onRefetch={triggerRefetch} 
          refetchCounter={refetchCounter} 
          currentUser={currentUser}
          showAddDirectly={showAddEventDirectly}
          onModalHandled={() => setShowAddEventDirectly(false)}
        />
      )}

      {currentPage === 'messages' && (
        <MessagesPage currentUser={currentUser} onMessagesRead={handleMessagesRead} />
      )}

      {currentPage === 'c-messages' && (
        <MessagesPage currentUser={currentUser} onMessagesRead={handleMessagesRead} />
      )}

      {currentPage === 'tasks' && (
        <TasksPage 
          onRefetch={triggerRefetch} 
          refetchCounter={refetchCounter} 
          currentUser={currentUser}
          showAddDirectly={showAddTaskDirectly}
          onModalHandled={() => setShowAddTaskDirectly(false)}
        />
      )}

      {currentPage === 'c-tasks' && (
        <TasksPage 
          onRefetch={triggerRefetch} 
          refetchCounter={refetchCounter} 
          currentUser={currentUser}
          showAddDirectly={showAddTaskDirectly}
          onModalHandled={() => setShowAddTaskDirectly(false)}
        />
      )}

      {currentPage === 'documents' && (
        <DocumentsPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} currentUser={currentUser} />
      )}

      {currentPage === 'c-docs' && (
        <DocumentsPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} currentUser={currentUser} />
      )}

      {currentPage === 'c-cohort' && (
        <CohortsPage onRefetch={triggerRefetch} refetchCounter={refetchCounter} />
      )}

      {currentPage === 'analytics' && (
        <AnalyticsPage />
      )}
      {showBroadcastDirectly && (
        <BroadcastModal 
          onClose={() => setShowBroadcastDirectly(false)} 
          onSuccess={() => {
            triggerRefetch();
          }}
          senderName={currentUser.name}
        />
      )}
    </AppShell>
  );
}
