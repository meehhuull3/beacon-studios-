import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44, supabase } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Users, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Group definitions
function getGroups(role, userCollegeId, colleges) {
  const groups = [];

  if (role === 'admin') {
    groups.push({ id: 'admins_associates', label: 'Admins & Associates', icon: '🔐', canSend: true });
    groups.push({ id: 'admins_all', label: 'Admins → All Users', icon: '📢', canSend: true });
    groups.push({ id: 'associates_faculty', label: 'Associates → All Faculty', icon: '🎓', canSend: false, readOnly: true });
    groups.push({ id: 'associates_coreteam', label: 'Associates → All Core Teams', icon: '👥', canSend: false, readOnly: true });
    groups.push({ id: 'associates_all', label: 'Associates → All Staff', icon: '🌐', canSend: false, readOnly: true });
    colleges.forEach(c => {
      groups.push({ id: `college_${c.id}`, label: c.name, icon: '🏛️', canSend: false, readOnly: true, collegeId: c.id });
    });
  } else if (role === 'associate') {
    groups.push({ id: 'admins_associates', label: 'Admins & Associates', icon: '🔐', canSend: true });
    groups.push({ id: 'admins_all', label: 'Admins → All Users', icon: '📢', canSend: false, readOnly: true });
    groups.push({ id: 'associates_faculty', label: 'Associates → All Faculty', icon: '🎓', canSend: true });
    groups.push({ id: 'associates_coreteam', label: 'Associates → All Core Teams', icon: '👥', canSend: true });
    groups.push({ id: 'associates_all', label: 'Associates → All Staff', icon: '🌐', canSend: true });
    colleges.forEach(c => {
      groups.push({ id: `college_${c.id}`, label: c.name, icon: '🏛️', canSend: false, readOnly: true, collegeId: c.id });
    });
  } else if (role === 'faculty') {
    groups.push({ id: 'admins_all', label: 'Admins Announcements', icon: '📢', canSend: false, readOnly: true });
    groups.push({ id: 'associates_faculty', label: 'Associates → Faculty', icon: '🎓', canSend: false, readOnly: true });
    groups.push({ id: 'associates_all', label: 'Associates → All Staff', icon: '🌐', canSend: false, readOnly: true });
    if (userCollegeId) {
      const college = colleges.find(c => c.id === userCollegeId);
      groups.push({ id: `college_${userCollegeId}`, label: college?.name || 'My College', icon: '🏛️', canSend: true, collegeId: userCollegeId });
    }
  } else if (role === 'core_team') {
    groups.push({ id: 'admins_all', label: 'Admins Announcements', icon: '📢', canSend: false, readOnly: true });
    groups.push({ id: 'associates_coreteam', label: 'Associates → Core Teams', icon: '👥', canSend: false, readOnly: true });
    groups.push({ id: 'associates_all', label: 'Associates → All Staff', icon: '🌐', canSend: false, readOnly: true });
    if (userCollegeId) {
      const college = colleges.find(c => c.id === userCollegeId);
      groups.push({ id: `college_${userCollegeId}`, label: college?.name || 'My College', icon: '🏛️', canSend: true, collegeId: userCollegeId });
    }
  }

  return groups;
}

export default function Messaging() {
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_at', 200),
  });

  const role = user?.role || 'core_team';
  const userCollegeId = user?.college_id;
  const groups = getGroups(role, userCollegeId, colleges);
  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0];

  // Auto-select first group
  useEffect(() => {
    if (!activeGroupId && groups.length > 0) setActiveGroupId(groups[0].id);
  }, [groups.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, activeGroupId]);

  // Realtime subscription
  useEffect(() => {
    if (!activeGroupId) return;
    const channel = supabase.channel(`messages_${activeGroupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message', filter: `group_id=eq.${activeGroupId}` }, payload => {
        qc.invalidateQueries({ queryKey: ['messages'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeGroupId, qc]);

  // Messages for active group, sorted oldest first
  const accountCreatedDate = user?.created_at ? new Date(user.created_at) : null;
  const groupMessages = allMessages
    .filter(m => {
      if (m.group_id !== (activeGroup?.id || activeGroupId)) return false;
      if (m.is_system || m.sender_role === 'system' || m.sender_name === 'System') return false; // Exclude system messages
      if (accountCreatedDate && m.created_at) {
        if (new Date(m.created_at) < accountCreatedDate) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const sendMut = useMutation({
    mutationFn: (content) => base44.entities.Message.create({
      group_id: activeGroup.id,
      sender_id: user?.id,
      sender_name: user?.full_name || 'Unknown',
      sender_role: role,
      content,
      is_system: false,
      college_id: activeGroup.collegeId || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      setInputText('');
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeGroup?.canSend) return;
    sendMut.mutate(inputText.trim());
  };

  const canSend = activeGroup?.canSend;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border flex flex-col bg-muted/20">
        <div className="px-4 py-4 border-b border-border">
          <h2 className="font-heading font-bold text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Messaging
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Group channels</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                activeGroupId === g.id && "bg-primary/10 border-r-2 border-primary"
              )}
            >
              <span className="text-base">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium truncate", activeGroupId === g.id && "text-primary")}>{g.label}</p>
                {g.readOnly && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                    <Lock className="w-2.5 h-2.5" /> Read only for you
                  </p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {allMessages.filter(m => {
                  if (m.group_id !== g.id) return false;
                  if (m.is_system || m.sender_role === 'system' || m.sender_name === 'System') return false; // Exclude system messages
                  if (accountCreatedDate && m.created_at) {
                    if (new Date(m.created_at) < accountCreatedDate) return false;
                  }
                  return true;
                }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <span className="text-xl">{activeGroup?.icon}</span>
          <div>
            <h3 className="font-heading font-semibold text-sm">{activeGroup?.label}</h3>
            <p className="text-xs text-muted-foreground">
              {canSend ? 'You can send messages here' : 'You can read messages here'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {groupMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-10 h-10 opacity-20 mb-3" />
              <p className="text-sm">No messages yet</p>
              {canSend && <p className="text-xs mt-1">Be the first to send a message!</p>}
            </div>
          )}
          {groupMessages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const isSystem = msg.is_system;
            const prevMsg = groupMessages[i - 1];
            const showDate = !prevMsg || format(new Date(msg.created_at), 'yyyy-MM-dd') !== format(new Date(prevMsg.created_at), 'yyyy-MM-dd');

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground">{format(new Date(msg.created_at), 'MMMM d, yyyy')}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                {isSystem ? (
                  <div className="flex justify-center">
                    <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                ) : (
                  <div className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {msg.sender_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className={cn("max-w-[65%]", isMe && "items-end flex flex-col")}>
                      <div className={cn("flex items-baseline gap-2 mb-1", isMe && "flex-row-reverse")}>
                        <span className="text-xs font-medium">{isMe ? 'You' : msg.sender_name}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{msg.sender_role?.replace('_', ' ')}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(msg.created_at), 'h:mm a')}</span>
                      </div>
                      <div className={cn(
                        "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                        isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-border">
          {canSend ? (
            <form onSubmit={handleSend} className="flex gap-3">
              <Input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Message ${activeGroup?.label}...`}
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!inputText.trim() || sendMut.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted/50 rounded-lg px-4 py-3">
              <Lock className="w-4 h-4" />
              You can only read messages in this channel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
