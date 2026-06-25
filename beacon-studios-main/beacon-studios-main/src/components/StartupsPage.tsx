import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Shield, Users, Mail, User, ShieldAlert, Check } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { Startup, College, User as AppUser, Cohort } from '../types';

interface StartupsPageProps {
  onRefetch: () => void;
  refetchCounter: number;
  currentUser: AppUser;
}

export default function StartupsPage({ onRefetch, refetchCounter, currentUser }: StartupsPageProps) {
  const isBI = currentUser.portal === 'bi';
  const isFaculty = currentUser.role === 'Faculty';

  const [startups, setStartups] = useState<Startup[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [advisors, setAdvisors] = useState<AppUser[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Add Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('Ed-tech');
  const [newColId, setNewColId] = useState('');
  const [newCohId, setNewCohId] = useState('');
  const [newLeadFounder, setNewLeadFounder] = useState('');
  const [newFacultyId, setNewFacultyId] = useState('');

  // View Modal Settings
  const [selectedSu, setSelectedSu] = useState<Startup | null>(null);
  const [selectedSuCol, setSelectedSuCol] = useState<College | null>(null);
  const [selectedSuCoh, setSelectedSuCoh] = useState<Cohort | null>(null);
  const [selectedSuFac, setSelectedSuFac] = useState<AppUser | null>(null);

  // Selector update helper
  const [assigningFacultyId, setAssigningFacultyId] = useState('');

  const loadStartupsData = async () => {
    const allStartups = await dbService.getStartups();
    const cols = await dbService.getColleges();
    const cohs = await dbService.getCohorts();
    const users = await dbService.getUsers();

    // Filter by college if not BI Admin
    const allowedStartups = isBI 
      ? allStartups 
      : isFaculty 
        ? allStartups.filter(s => s.faculty_id === currentUser.id)
        : allStartups.filter(s => s.college_id === currentUser.college_id);

    setStartups(allowedStartups);
    setColleges(cols);
    setCohorts(cohs);
    
    const facs = users.filter(u => u.role === 'Faculty');
    setAdvisors(facs);

    if (cols.length > 0) setNewColId(currentUser.college_id || cols[0].id);
    if (cohs.length > 0) setNewCohId(cohs[0].id);
    if (facs.length > 0) setNewFacultyId(facs[0].id);
  };

  useEffect(() => {
    loadStartupsData();
  }, [refetchCounter, currentUser]);

  const handleRowClick = async (su: Startup) => {
    setSelectedSu(su);
    setSelectedSuCol(colleges.find(c => c.id === su.college_id) || null);
    setSelectedSuCoh(cohorts.find(c => c.id === su.cohort_id) || null);
    
    const faculty = advisors.find(u => u.id === su.faculty_id);
    setSelectedSuFac(faculty || null);
    setAssigningFacultyId(su.faculty_id || '');
  };

  const handleUpdateFaculty = async () => {
    if (!selectedSu) return;
    const facId = assigningFacultyId === 'none' ? null : assigningFacultyId;
    
    await dbService.updateStartupFaculty(selectedSu.id, facId);
    
    // Refresh local lists
    await loadStartupsData();
    
    // Re-locate updated startup
    const updatedSu = startups.find(s => s.id === selectedSu.id);
    if (updatedSu) {
      setSelectedSu({ ...selectedSu, faculty_id: facId });
      setSelectedSuFac(advisors.find(u => u.id === facId) || null);
    }
    
    onRefetch();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDomain || !newLeadFounder) return;

    await dbService.addStartup({
      college_id: isBI ? newColId : (currentUser.college_id || '1'),
      cohort_id: newCohId,
      name: newName,
      domain: newDomain,
      stage: 'Ideation', // start at ideation
      lead_founder: newLeadFounder,
      faculty_id: newFacultyId ? newFacultyId : null
    });

    setNewName('');
    setNewLeadFounder('');
    setShowAddModal(false);

    onRefetch();
    loadStartupsData();
  };

  // Stage filters matching live values
  const filteredStartups = startups.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.lead_founder.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' ? true : s.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="flex flex-col gap-4 text-left text-[#1B2240]">
      
      {/* FILTER CONTROL BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto max-sm:w-full">
          {['All', 'Revenue', 'MVP live', 'Validating', 'Ideation'].map(stageName => (
            <button 
              key={stageName}
              onClick={() => setStageFilter(stageName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                stageFilter === stageName 
                  ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' 
                  : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'
              }`}
            >
              {stageName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 max-sm:w-full">
          <div className="flex items-center gap-2 bg-[#F4F5F7] border border-[#E2E5EC] rounded-lg px-3 py-1.5 text-xs text-[#4A5270] w-52 max-sm:w-full">
            <Search className="w-3.5 h-3.5 text-[#8891B0] shrink-0" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search domain/foundry..." 
              className="bg-transparent border-none text-xs outline-none w-full text-[#1B2240]"
            />
          </div>

          {!isFaculty && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans'] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Startup</span>
            </button>
          )}
        </div>
      </div>

      {/* STARTUPS TABULAR DATABASE */}
      <div className="bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E2E5EC] text-[#8891B0]">
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4 pl-6">Startup Venture</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">University Campus</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Industry Domain</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Milestone Stage</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Liaison Mentor</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4 pr-6">Activity Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7]">
              {filteredStartups.map(su => {
                const college = colleges.find(c => c.id === su.college_id);
                const faculty = advisors.find(f => f.id === su.faculty_id);
                
                return (
                  <tr 
                    key={su.id}
                    onClick={() => handleRowClick(su)}
                    className="hover:bg-[#F4F5F7] cursor-pointer transition-all"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black text-xs shrink-0">
                          {su.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-xs text-[#1B2240]">{su.name}</div>
                          <div className="text-[10.5px] text-[#8891B0] mt-0.5">Founder: {su.lead_founder}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-[#4A5270] text-left">
                      {college ? college.name : 'Unknown Campus'}
                    </td>
                    <td className="p-4 text-left">
                      <span className="text-xs px-2.5 py-1 bg-[#F4F5F7] border border-[#E2E5EC] rounded-md font-semibold text-[#4A5270]">
                        {su.domain}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        su.stage === 'Revenue' || su.stage === 'MVP live' ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' :
                        su.stage === 'Validating' ? 'bg-[#F5A623]/10 text-[#b45309]' : 'bg-[#E2E5EC] text-[#4A5270]'
                      }`}>
                        {su.stage}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-[#4A5270] text-left">
                      {faculty ? faculty.name : <span className="text-[#8891B0] italic">Unassigned</span>}
                    </td>
                    <td className="p-4 pr-6 text-xs text-[#8891B0] font-medium text-left">
                      {su.last_updated ? new Date(su.last_updated).toLocaleDateString() : 'Syncing'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED DIALOG MODAL CARD */}
      {selectedSu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => setSelectedSu(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-left border border-[#E2E5EC] z-50 animate-[fadeIn_0.15s_ease]">
            <button 
              onClick={() => setSelectedSu(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black text-sm shrink-0">
                {selectedSu.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-['Bricolage_Grotesque'] text-sm font-black text-[#1B2240]">{selectedSu.name}</h4>
                <p className="text-[11px] text-[#8891B0] mt-0.5">{selectedSu.domain} · Lead founder: {selectedSu.lead_founder}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 py-3 border-y border-[#F4F5F7] text-xs">
              <div className="flex justify-between">
                <span className="text-[#8891B0] font-bold uppercase tracking-wider text-[10px]">Academic Campus</span>
                <span className="text-[#1B2240] font-semibold">{selectedSuCol ? selectedSuCol.name : 'Partner Campus'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8891B0] font-bold uppercase tracking-wider text-[10px]">Cohort season</span>
                <span className="text-[#1B2240] font-semibold">{selectedSuCoh ? selectedSuCoh.name : 'Summer Cohort 2025'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8891B0] font-bold uppercase tracking-wider text-[10px]">Current Milestone</span>
                <span className="text-xs px-2 bg-[#2DC5A2]/10 text-[#1a8f74] font-bold rounded-full">{selectedSu.stage}</span>
              </div>
            </div>

            {/* ASSIGN MENTOR SELECTOR (FOR ADMISSIONS OR ASSOCIATES) */}
            {isBI && (
              <div className="mt-4">
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Assign Faculty Advisor</label>
                <div className="flex gap-2">
                  <select 
                    value={assigningFacultyId}
                    onChange={(e) => setAssigningFacultyId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="none">Unassigned / No mentor</option>
                    {advisors.map(adv => (
                      <option key={adv.id} value={adv.id}>{adv.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleUpdateFaculty}
                    className="p-1.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center border-none"
                    title="Confirm Assignment"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW STARTUP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => setShowAddModal(false)}
          />
          <form 
            onSubmit={handleAddSubmit}
            className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-left border border-[#E2E5EC] z-50 animate-[fadeIn_0.15s_ease]"
          >
            <div className="flex items-center justify-between border-b border-[#E2E5EC] pb-3.5 mb-4">
              <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1B2240]">Venture Onboarding Application</span>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Venture Brand Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. AgriSense, LogiFlow" 
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Industry Domain</label>
                  <select 
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="Ed-Tech">Ed-Tech</option>
                    <option value="Agri-Tech">Agri-Tech</option>
                    <option value="Health-Tech">Health-Tech</option>
                    <option value="Logistics">Logistics</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="PropTech">PropTech</option>
                    <option value="FinTech">FinTech</option>
                    <option value="FoodTech">FoodTech</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Lead Student Founder</label>
                <input 
                  type="text" 
                  value={newLeadFounder}
                  onChange={(e) => setNewLeadFounder(e.target.value)}
                  placeholder="e.g. Aditya Verma" 
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isBI && (
                  <div>
                    <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Partner University</label>
                    <select 
                      value={newColId}
                      onChange={(e) => setNewColId(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    >
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Associated Cohort</label>
                  <select 
                    value={newCohId}
                    onChange={(e) => setNewCohId(e.target.value)}
                    className="w-full px-2.5 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-[11px] outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    {cohorts.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Faculty Advisor Mentor</label>
                <select 
                  value={newFacultyId}
                  onChange={(e) => setNewFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                >
                  <option value="">Unassigned</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-5 py-2.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] cursor-pointer transition-all border-none"
            >
              Confirm Venture Onboarding
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
