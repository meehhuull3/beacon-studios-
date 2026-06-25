import React, { useState, useEffect } from 'react';
import { Plus, X, Tag, Calendar, AlertCircle, Building, CheckCircle2, UserCheck } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { Task, User, College } from '../types';

interface TasksPageProps {
  onRefetch: () => void;
  refetchCounter: number;
  currentUser: User;
  showAddDirectly: boolean;
  onModalHandled: () => void;
}

export default function TasksPage({ onRefetch, refetchCounter, currentUser, showAddDirectly, onModalHandled }: TasksPageProps) {
  const isBI = currentUser.portal === 'bi';
  const collegeId = currentUser.college_id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filter, setFilter] = useState<'All' | 'Overdue' | 'Due soon' | 'Completed'>('All');

  // Add Task Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [dueDate, setDueDate] = useState('2026-06-15');
  const [taskTag, setTaskTag] = useState('Docs');
  const [targetType, setTargetType] = useState<'bi' | 'college'>('bi');
  const [assignCollegeId, setAssignCollegeId] = useState<string>('');

  const loadTasksData = async () => {
    const list = await dbService.getTasks();
    const cols = await dbService.getColleges();

    setColleges(cols);
    if (cols.length > 0) setAssignCollegeId(cols[0].id);

    // Filters depending on context
    const allowed = isBI 
      ? list 
      : list.filter(t => (t.assigned_to_college_id === collegeId) || (t.assigned_to_user_id === currentUser.id));

    setTasks(allowed);
  };

  useEffect(() => {
    loadTasksData();
  }, [refetchCounter]);

  useEffect(() => {
    if (showAddDirectly) {
      setShowAddModal(true);
      onModalHandled();
    }
  }, [showAddDirectly]);

  const handleToggleDone = async (id: string, done: boolean) => {
    await dbService.toggleTaskDone(id, done);
    loadTasksData();
    onRefetch(); // trigger header / dashboard counter updates
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText || !dueDate) return;

    await dbService.addTask({
      assigned_to_user_id: targetType === 'bi' ? currentUser.id : null,
      assigned_to_college_id: targetType === 'college' ? assignCollegeId : null,
      text: taskText,
      due_date: new Date(dueDate).toISOString(),
      tag: taskTag
    });

    setTaskText('');
    setShowAddModal(false);

    onRefetch();
    loadTasksData();
  };

  // Filter lists
  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Completed') return t.done;
    
    // determine upcoming vs overdue
    const isPastDue = new Date(t.due_date) < new Date() && !t.done;
    const isSoon = !t.done && !isPastDue && (new Date(t.due_date).getTime() - new Date().getTime() <= 5 * 24 * 60 * 60 * 1000); // 5 days soon

    if (filter === 'Overdue') {
      return isPastDue;
    }
    if (filter === 'Due soon') {
      return isSoon || isPastDue; // show critical ones
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4 text-left text-[#1B2240]">
      
      {/* ACTION TABS FILTER BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-sm:w-full">
          {['All', 'Overdue', 'Due soon', 'Completed'].map(fName => (
            <button
              key={fName}
              onClick={() => setFilter(fName as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                filter === fName 
                  ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' 
                  : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'
              }`}
            >
              {fName}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans'] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Core Personal Tasks Column */}
        <div className="bg-white border border-[#E2E5EC] rounded-[14px] p-5 shadow-sm">
          <div className="border-b border-[#F4F5F7] pb-3 mb-4 flex items-center justify-between text-left">
            <h4 className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#2DC5A2]" />
              <span>Workspace Action Items</span>
            </h4>
            <span className="text-[10px] bg-[#2DC5A2]/10 text-[#2DC5A2] px-2 py-0.5 rounded-full font-bold">
              {filteredTasks.filter(t => !t.assigned_to_college_id).length} open
            </span>
          </div>

          <div className="flex flex-col max-h-[360px] overflow-y-auto divide-y divide-[#F4F5F7]">
            {filteredTasks
              .filter(t => !t.assigned_to_college_id)
              .map(t => {
                const isOverdue = new Date(t.due_date) < new Date() && !t.done;
                
                return (
                  <div 
                    key={t.id} 
                    className="flex items-start gap-3 py-3 text-left first:pt-0 last:pb-0"
                  >
                    <input 
                      type="checkbox" 
                      checked={t.done}
                      onChange={(e) => handleToggleDone(t.id, e.target.checked)}
                      className="w-4.5 h-4.5 text-[#2DC5A2] border-[#E2E5EC] rounded focus:ring-0 cursor-pointer mt-0.5 accent-[#2DC5A2]"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold text-[#1B2240] ${t.done ? 'line-through text-[#8891B0]' : ''}`}>
                        {t.text}
                      </div>

                      <div className="flex items-center gap-3.5 mt-1 text-[10.5px]">
                        <span className={`font-semibold flex items-center gap-1 shrink-0 ${
                          t.done ? 'text-[#8891B0]' :
                          isOverdue ? 'text-red-500 font-bold' : 'text-[#8891B0]'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{t.done ? 'Finished' : `Due: ${new Date(t.due_date).toLocaleDateString()}`}</span>
                        </span>
                        
                        <span className="flex items-center gap-1 text-[#8891B0] shrink-0 font-semibold bg-[#F4F5F7] px-2 py-0.5 rounded-md">
                          <Tag className="w-3 h-3 text-[#CBD0DC]" />
                          <span>{t.tag}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {filteredTasks.filter(t => !t.assigned_to_college_id).length === 0 && (
              <div className="p-8 text-center text-xs text-[#8891B0]">No pending action items list</div>
            )}
          </div>
        </div>

        {/* Assigned directly to College Hubs list */}
        <div className="bg-white border border-[#E2E5EC] rounded-[14px] p-5 shadow-sm">
          <div className="border-b border-[#F4F5F7] pb-3 mb-4 flex items-center justify-between text-left">
            <h4 className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#3B82F6]" />
              <span>Assigned College Deliverables</span>
            </h4>
            <span className="text-[10px] bg-[#3B82F6]/10 text-[#3b82f6] px-2 py-0.5 rounded-full font-bold">
              {filteredTasks.filter(t => t.assigned_to_college_id).length} monitoring
            </span>
          </div>

          <div className="flex flex-col max-h-[360px] overflow-y-auto divide-y divide-[#F4F5F7]">
            {filteredTasks
              .filter(t => t.assigned_to_college_id)
              .map(t => {
                const partnerCol = colleges.find(c => c.id === t.assigned_to_college_id);
                const isOverdue = new Date(t.due_date) < new Date() && !t.done;

                return (
                  <div 
                    key={t.id} 
                    className="flex items-start gap-3 py-3 text-left first:pt-0 last:pb-0"
                  >
                    {!isBI ? (
                      <input 
                        type="checkbox" 
                        checked={t.done}
                        onChange={(e) => handleToggleDone(t.id, e.target.checked)}
                        className="w-4.5 h-4.5 text-[#2DC5A2] border-[#E2E5EC] rounded focus:ring-0 cursor-pointer mt-0.5 accent-[#2DC5A2]"
                      />
                    ) : (
                      <div className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 mt-1 border-2 text-[10px] ${
                        t.done ? 'bg-[#2DC5A2] border-[#2DC5A2] text-white' : 'border-[#CBD0DC]'
                      }`}>
                        {t.done ? '✓' : ''}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold text-[#1B2240] ${t.done ? 'line-through text-[#8891B0]' : ''}`}>
                        {t.text}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px]">
                        <span className={`font-semibold flex items-center gap-1 ${
                          t.done ? 'text-[#8891B0]' :
                          isOverdue ? 'text-red-500 font-bold' : 'text-[#8891B0]'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{t.done ? 'Finished' : `Due: ${new Date(t.due_date).toLocaleDateString()}`}</span>
                        </span>

                        <span className="text-[#3B82F6] font-bold uppercase tracking-wider bg-[#3B82F6]/5 px-2 py-0.5 rounded-md">
                          🏫 {partnerCol ? partnerCol.name : 'College'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {filteredTasks.filter(t => t.assigned_to_college_id).length === 0 && (
              <div className="p-8 text-center text-xs text-[#8891B0]">No pending college deliverables listed</div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE TASK FORMS DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => {
              setShowAddModal(false);
              onModalHandled();
            }}
          />
          <form 
            onSubmit={handleCreateTask}
            className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-left border border-[#E2E5EC] z-50 animate-[fadeIn_0.15s_ease]"
          >
            <div className="flex items-center justify-between border-b border-[#E2E5EC] pb-3.5 mb-4">
              <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1B2240]">Assign Task Milestone</span>
              <button 
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  onModalHandled();
                }}
                className="p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Milestone Description</label>
                <input 
                  type="text" 
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="e.g. Upload 3 startup Pitch One-Pagers, Confirm Demo Day venue" 
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Category Tag</label>
                  <select 
                    value={taskTag}
                    onChange={(e) => setTaskTag(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="Docs">Documents</option>
                    <option value="Events">Events</option>
                    <option value="Report">Report</option>
                    <option value="MoU">Legal MoU</option>
                    <option value="Roster">Roster</option>
                  </select>
                </div>
              </div>

              {isBI && (
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Recipient Assignment Target</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#1B2240] cursor-pointer">
                      <input 
                        type="radio" 
                        name="target" 
                        checked={targetType === 'bi'} 
                        onChange={() => setTargetType('bi')} 
                        className="accent-[#2DC5A2]"
                      />
                      <span>Personal task (Me)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-[#1B2240] cursor-pointer">
                      <input 
                        type="radio" 
                        name="target" 
                        checked={targetType === 'college'} 
                        onChange={() => setTargetType('college')} 
                        className="accent-[#2DC5A2]"
                      />
                      <span>Assign to Partner College hub</span>
                    </label>
                  </div>

                  {targetType === 'college' && (
                    <select 
                      value={assignCollegeId}
                      onChange={(e) => setAssignCollegeId(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    >
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full mt-5 py-2.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] cursor-pointer transition-all border-none"
            >
              Add Active Milestone
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
