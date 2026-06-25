import React, { useState, useEffect } from 'react';
import { 
  X, Send, Megaphone, Bell, MessageSquare, CheckSquare, 
  Building, AlertCircle, Sparkles, CheckCircle, Hourglass 
} from 'lucide-react';
import { dbService } from '../supabaseClient';
import { College } from '../types';

interface BroadcastModalProps {
  onClose: () => void;
  onSuccess: () => void;
  senderName: string;
}

export default function BroadcastModal({ onClose, onSuccess, senderName }: BroadcastModalProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [targetAll, setTargetAll] = useState(true);
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  
  // Channels
  const [channelNotif, setChannelNotif] = useState(true);
  const [channelChat, setChannelChat] = useState(true);
  const [channelTask, setChannelTask] = useState(false);

  // Form data
  const [messageText, setMessageText] = useState('');
  const [tag, setTag] = useState('Announcement');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default due date 1 week out
    return d.toISOString().split('T')[0];
  });

  // Loading and State management
  const [isSending, setIsSending] = useState(false);
  const [successReport, setSuccessReport] = useState<{
    notifsCount: number;
    chatsCount: number;
    tasksCount: number;
  } | null>(null);
  const [errorString, setErrorString] = useState<string | null>(null);

  // Load available colleges for targets
  useEffect(() => {
    dbService.getColleges().then(data => {
      setColleges(data);
    });
  }, []);

  const handleToggleCollege = (collegeId: string) => {
    setSelectedColleges(prev => {
      if (prev.includes(collegeId)) {
        return prev.filter(id => id !== collegeId);
      } else {
        return [...prev, collegeId];
      }
    });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorString(null);

    const trimmedMsg = messageText.trim();
    if (!trimmedMsg) {
      setErrorString('Please write a broadcast message contents before transmitting.');
      return;
    }

    if (!channelNotif && !channelChat && !channelTask) {
      setErrorString('Please select at least one broadcast channel (Bell, Chat, or Task).');
      return;
    }

    const targets = targetAll 
      ? colleges 
      : colleges.filter(c => selectedColleges.includes(c.id));

    if (targets.length === 0) {
      setErrorString('Please select at least one recipient college.');
      return;
    }

    setIsSending(true);

    try {
      let notifsCount = 0;
      let chatsCount = 0;
      let tasksCount = 0;

      // 1. Process Bell Notifications
      if (channelNotif) {
        // Broadcast notification with elegant HTML styling
        const htmlText = `<span class="font-bold text-[#1B2240]">[Broadcast] ${tag}:</span> ${trimmedMsg} <span class="text-[#8891B0]">— sent by ${senderName}</span>`;
        await dbService.addNotification(null, htmlText);
        notifsCount = targets.length; // broadcast to everyone, approx targets
      }

      // 2. Process Chat Messages inside College Conversations
      if (channelChat) {
        const convList = await dbService.getConversations();
        for (const college of targets) {
          // Find or create a matching conversation for the college
          const conv = await dbService.getOrCreateCollegeConversation(college.id, college.name);
          if (conv) {
            await dbService.sendMessage(
              conv.id, 
              'u1', // Admin sender ID
              `📢 BROADCAST ANNOUNCEMENT [${tag}] \n\n${trimmedMsg}\n\n— Broadcast dispatched by ${senderName}`
            );
            chatsCount++;
          }
        }
      }

      // 3. Process Cohort Checklist Action Tasks
      if (channelTask) {
        for (const college of targets) {
          await dbService.addTask({
            assigned_to_user_id: null,
            assigned_to_college_id: college.id,
            text: `[Broadcast Task]: ${trimmedMsg}`,
            due_date: new Date(dueDate).toISOString(),
            tag: tag
          });
          tasksCount++;
        }
      }

      // Complete
      setSuccessReport({
        notifsCount,
        chatsCount,
        tasksCount
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorString(err.message || 'An error occurred while broadcasting.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1B2240]/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5EC] shadow-2xl w-full max-w-xl overflow-hidden my-auto">
        
        {/* HEADER */}
        <div className="px-6 py-4.5 bg-[#1B2240] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#2DC5A2]/20 rounded-lg text-[#2DC5A2]">
              <Megaphone className="w-5 h-5 animate-bounce-slow" />
            </div>
            <div>
              <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold">Transmit Broadcast Announcement</h3>
              <p className="text-[11px] text-gray-300">Publish announcements, chat alerts, and critical actions instantly</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        {!successReport ? (
          <form onSubmit={handleSendBroadcast} className="p-6 space-y-5 text-left text-sm text-[#1B2240]">
            {errorString && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorString}</span>
              </div>
            )}

            {/* MESSAGE BODY */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wide uppercase text-[#8891B0]">
                Broadcast Message Contents
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your announcement detail here... Keep it clear, concise and actionable."
                rows={4}
                className="w-full bg-[#F4F5F7] border border-[#E2E5EC] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#2DC5A2] focus:ring-2 focus:ring-[#2DC5A2]/5 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TAG / CATEGORY */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wide uppercase text-[#8891B0]">
                  Priority Tag / Category
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-[#E2E5EC] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2DC5A2] cursor-pointer"
                >
                  <option value="Announcement">📢 Announcement</option>
                  <option value="Urgent">🚨 Urgent Action Required</option>
                  <option value="Milestones">🏆 Milestone Highlight</option>
                  <option value="Advisory">🎓 Advisory Meeting</option>
                  <option value="Report">📋 Report / Compliance</option>
                </select>
              </div>

              {/* CHANNELS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wide uppercase text-[#8891B0]">
                  Broadcast Channels
                </label>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={channelNotif} 
                      onChange={(e) => setChannelNotif(e.target.checked)}
                      className="rounded border-[#E2E5EC] text-[#2DC5A2] focus:ring-[#2DC5A2] cursor-pointer" 
                    />
                    <Bell className="w-3.5 h-3.5 text-[#2DC5A2]" />
                    <span>Bell Notifications Panel</span>
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={channelChat} 
                      onChange={(e) => setChannelChat(e.target.checked)}
                      className="rounded border-[#E2E5EC] text-[#2DC5A2] focus:ring-[#2DC5A2] cursor-pointer" 
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span>Inbox Chat Announcement</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={channelTask} 
                      onChange={(e) => setChannelTask(e.target.checked)}
                      className="rounded border-[#E2E5EC] text-[#2DC5A2] focus:ring-[#2DC5A2] cursor-pointer" 
                    />
                    <CheckSquare className="w-3.5 h-3.5 text-[#f5a623]" />
                    <span>Assign Cohort Checklist Task</span>
                  </label>
                </div>
              </div>
            </div>

            {/* TASK DUE DATE FIELD (conditional) */}
            {channelTask && (
              <div className="space-y-1.5 p-3.5 bg-yellow-50/50 border border-yellow-100 rounded-xl animate-fade-in">
                <label className="block text-xs font-bold tracking-wide uppercase text-yellow-800">
                  Broadcast Task Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-[#E2E5EC] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#f5a623]"
                />
                <p className="text-[10px] text-yellow-700/80">Every recipient college will automatically receive this task on their tracker boards.</p>
              </div>
            )}

            {/* AUDIENCE SELECTOR */}
            <div className="space-y-2 border-t border-[#F4F5F7] pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold tracking-wide uppercase text-[#8891B0]">
                  Recipient Audience
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAll(true)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      targetAll 
                        ? 'bg-[#1B2240] text-white' 
                        : 'bg-[#F4F5F7] text-[#4A5270] hover:bg-[#E2E5EC]'
                    }`}
                  >
                    All Colleges ({colleges.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAll(false);
                      if (selectedColleges.length === 0 && colleges.length > 0) {
                        setSelectedColleges([colleges[0].id]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      !targetAll 
                        ? 'bg-[#1B2240] text-white' 
                        : 'bg-[#F4F5F7] text-[#4A5270] hover:bg-[#E2E5EC]'
                    }`}
                  >
                    Select Specific
                  </button>
                </div>
              </div>

              {!targetAll && (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3.5 bg-[#F4F5F7] rounded-xl border border-[#E2E5EC]">
                  {colleges.map(c => {
                    const isChecked = selectedColleges.includes(c.id);
                    return (
                      <label 
                        key={c.id} 
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all ${
                          isChecked ? 'bg-white text-[#1B2240] shadow-xs' : 'text-[#8891B0] hover:text-[#4A5270]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCollege(c.id)}
                          className="rounded border-[#E2E5EC] text-[#2DC5A2] focus:ring-[#2DC5A2]"
                        />
                        <Building className="w-3.5 h-3.5 text-[#8891B0] shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F5F7]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#4A5270] bg-[#F4F5F7] hover:bg-[#E2E5EC] rounded-xl transition-all cursor-pointer"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2DC5A2] hover:bg-[#22a088] active:scale-98 text-[#1B2240] font-black text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Hourglass className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* SUCCESS SCREEN REPORT */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#2DC5A2]/10 text-[#2DC5A2] flex items-center justify-center rounded-2xl mx-auto">
              <CheckCircle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-[#1B2240]">
                Broadcast Dispatched Successfully!
              </h4>
              <p className="text-xs text-[#8891B0]">
                Transmitted and propagated changes across all channels in the ecosystem.
              </p>
            </div>

            {/* REPORT BOX */}
            <div className="bg-[#F4F5F7] border border-[#E2E5EC] rounded-xl p-4.5 text-left max-w-sm mx-auto space-y-3.5">
              <div className="text-xs font-bold tracking-wide text-[#8891B0] uppercase border-b border-[#E2E5EC] pb-2">
                ECOSYSTEM DISPATCH REPORT
              </div>
              
              <div className="space-y-2.5 text-xs text-[#4A5270] font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#2DC5A2]" />
                    <span>Bell Notifications Sent</span>
                  </div>
                  <span className="font-extrabold bg-[#2DC5A2]/10 text-[#2DC5A2] px-2 py-0.5 rounded-full">
                    {successReport.notifsCount > 0 ? `✓ Global Banner Active` : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#3b82f6]" />
                    <span>College Inbox Announcements</span>
                  </div>
                  <span className="font-extrabold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                    {successReport.chatsCount} chats updated
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#f5a623]" />
                    <span>Checklist Action Items Assigned</span>
                  </div>
                  <span className="font-extrabold bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full">
                    {successReport.tasksCount} cohort tasks
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1B2240] text-white hover:bg-[#2c365d] rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Dismiss Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
