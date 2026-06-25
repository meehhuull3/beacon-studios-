import React, { useState, useEffect } from 'react';
import { X, Users, MessageSquare, Plus, CheckCircle, HelpCircle, Shield, Building2 } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { User, College, Conversation } from '../types';

interface CreateTeamModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: (newConv: Conversation) => void;
}

export default function CreateTeamModal({ currentUser, onClose, onSuccess }: CreateTeamModalProps) {
  const isBI = currentUser.portal === 'bi';

  // State management
  const [activeTab, setActiveTab] = useState<'create_team' | 'browse_colleges'>('create_team');
  const [users, setUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  // Team creation state
  const [teamName, setTeamName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([currentUser.id]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load registered platform users & colleges
    const loadData = async () => {
      const uList = await dbService.getUsers();
      const cList = await dbService.getColleges();
      setUsers(uList);
      setColleges(cList);
    };
    loadData();
  }, []);

  const handleToggleTeammate = (userId: string) => {
    if (userId === currentUser.id) return; // Creator is strictly forced to be a member
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameTrimmed = teamName.trim();
    if (!nameTrimmed) {
      setErrorMessage('Please provide a descriptive name for the new team.');
      return;
    }

    if (selectedUsers.length < 2) {
      setErrorMessage('Please select at least one teammate to form a team.');
      return;
    }

    setLoading(true);
    try {
      // Admin/User triggers creation of the customized team conversation channel
      const newConv = await dbService.addTeamConversation(
        nameTrimmed, 
        'team', 
        currentUser.college_id, 
        selectedUsers
      );
      
      // Pre-add a system welcoming message so the channel doesn't render empty
      await dbService.sendMessage(
        newConv.id, 
        'bi_system', 
        `✨ Team channel "${nameTrimmed}" has been initialized by ${currentUser.name}. Teammates can post instant messages, synchronize checklists, and coordinate projects here safely.`
      );

      onSuccess(newConv);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while creating the team.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCollegeChannel = async (college: College) => {
    setLoading(true);
    try {
      // Find or create a matching college channel conversation
      const conv = await dbService.getOrCreateCollegeConversation(college.id, college.name);
      
      // Add current user to membership list so it shows in their sidebar channel
      const membersList = localStorage.getItem('beacon_conversation_members')
        ? JSON.parse(localStorage.getItem('beacon_conversation_members')!)
        : [];
      
      const containsMembership = membersList.some((m: any) => m.conversation_id === conv.id && m.user_id === currentUser.id);
      
      if (!containsMembership) {
        membersList.push({ conversation_id: conv.id, user_id: currentUser.id });
        localStorage.setItem('beacon_conversation_members', JSON.stringify(membersList));
        
        await dbService.sendMessage(
          conv.id, 
          'bi_system', 
          `👤 ${currentUser.name} (${currentUser.role}) has connected to the ${college.name} operational channel.`
        );
      }
      
      onSuccess(conv);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not open conversation with this college.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1B2240]/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5EC] shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-fade-in text-[#1B2240]">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-[#1B2240] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#2DC5A2]/20 rounded-lg text-[#2DC5A2]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Bricolage_Grotesque'] font-bold text-base text-white">Ecosystem Navigation Hub</h3>
              <p className="text-[10px] text-gray-300">Form custom channels, choose roommates, and link other colleges</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ECOSYSTEM HUB SELECTIONS */}
        <div className="flex border-b border-[#E2E5EC] bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('create_team')}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'create_team' 
                ? 'border-[#2DC5A2] text-[#2DC5A2] bg-white' 
                : 'border-transparent text-[#8891B0] hover:text-[#4A5270]'
            }`}
          >
            🤝 Setup Team / Squad Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('browse_colleges')}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'browse_colleges' 
                ? 'border-[#2DC5A2] text-[#2DC5A2] bg-white' 
                : 'border-transparent text-[#8891B0] hover:text-[#4A5270]'
            }`}
          >
            🎓 Interface of Other Colleges
          </button>
        </div>

        {/* MODAL PANEL CONTENT */}
        <div className="p-5">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'create_team' ? (
            /* CREATE TEAM VIEW */
            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8891B0]">
                  Team / Squad Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., AI Research Team, VJTI Demo Day Squad, MoU Review Committee"
                  className="w-full bg-[#F4F5F7] border border-[#E2E5EC] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#2DC5A2]"
                  required
                />
              </div>

              {/* TEAMMATES SELECTOR CHECKBOX LIST */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8891B0]">
                    Select Teammates / Roommates
                  </label>
                  <span className="text-[10px] font-bold text-[#8891B0]">
                    {selectedUsers.length} Selected
                  </span>
                </div>

                <div className="border border-[#E2E5EC] rounded-xl bg-slate-50/50 p-2.5 max-h-48 overflow-y-auto space-y-1.5">
                  {users.map(u => {
                    const isSelf = u.id === currentUser.id;
                    const isChecked = selectedUsers.includes(u.id);

                    return (
                      <div 
                        key={u.id}
                        onClick={() => handleToggleTeammate(u.id)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-[#2DC5A2]/10 text-[#1a8f74] border border-[#2DC5A2]/30' 
                            : 'hover:bg-white text-gray-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6.5 h-6.5 rounded-full bg-[#1B2240] text-[#2DC5A2] font-black text-[9px] flex items-center justify-center">
                            {u.initials}
                          </div>
                          <div className="truncate text-left">
                            <span className="font-bold text-[#1B2240]">{u.name}</span>
                            <span className="text-[10px] text-[#8891B0] ml-1.5">({u.role})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelf ? (
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                              Organizer
                            </span>
                          ) : isChecked ? (
                            <span className="w-4 h-4 rounded-full bg-[#2DC5A2] text-white flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-[#E2E5EC] bg-white block" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONS ROW */}
              <div className="pt-4 border-t border-[#F4F5F7] flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#4A5270] bg-[#F4F5F7] hover:bg-[#E2E5EC] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !teamName.trim()}
                  className="px-5 py-2.5 bg-[#2DC5A2] py-2 text-[#1B2240] font-extrabold hover:bg-[#22a088] rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Establish Squad Chat</span>
                </button>
              </div>
            </form>
          ) : (
            /* BROWSE AND CONNECT PORTALS OF OTHER COLLEGES */
            <div className="space-y-4">
              <p className="text-xs text-[#8891B0] text-left">
                Start sharing feedback and announcements directly with different college incubators and cohorts in the beacon ecosystem.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1 text-left">
                {colleges.map(college => {
                  return (
                    <div 
                      key={college.id}
                      onClick={() => handleJoinCollegeChannel(college)}
                      className="p-3 bg-slate-50 hover:bg-[#2DC5A2]/5 border border-[#E2E5EC] hover:border-[#2DC5A2]/30 rounded-xl cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-[#1B2240] text-[#2DC5A2] rounded-lg shrink-0 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1B2240] group-hover:text-[#2DC5A2] truncate">
                            {college.name}
                          </div>
                          <div className="text-[10px] text-[#8891B0] truncate">
                            {college.city}, {college.state}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[10.5px]">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                          {college.status} Status
                        </span>
                        <span className="text-[#2DC5A2] font-extrabold group-hover:underline">
                          Open Chat →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-[#1B2240] text-white hover:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Hub
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
