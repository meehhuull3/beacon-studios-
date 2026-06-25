import React, { useState, useEffect } from 'react';
import { Users, Rocket, Calendar, MapPin, X, Plus, Search, CalendarDays } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { Cohort, College, Founder, Startup } from '../types';

interface CohortsPageProps {
  onRefetch: () => void;
  refetchCounter: number;
}

export default function CohortsPage({ onRefetch, refetchCounter }: CohortsPageProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Addition Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCohName, setNewCohName] = useState('');
  const [newCohColId, setNewCohColId] = useState('');
  const [newCohStage, setNewCohStage] = useState<'Ideation' | 'Validation' | 'Prototype' | 'Validating' | 'Scaling'>('Ideation');
  const [newCohStartDate, setNewCohStartDate] = useState('2025-06-11');
  const [newCohWeeks, setNewCohWeeks] = useState(16);

  // Drawer Detail States
  const [selectedCoh, setSelectedCoh] = useState<Cohort | null>(null);
  const [selectedCohCol, setSelectedCohCol] = useState<College | null>(null);
  const [selectedCohFounders, setSelectedCohFounders] = useState<Founder[]>([]);
  const [selectedCohStartups, setSelectedCohStartups] = useState<Startup[]>([]);
  
  // Search within selected cohort
  const [cohortSearch, setCohortSearch] = useState('');

  const loadCohortsData = async () => {
    const list = await dbService.getCohorts();
    const cols = await dbService.getColleges();
    setCohorts(list);
    setColleges(cols);
    if (cols.length > 0) {
      setNewCohColId(cols[0].id);
    }
  };

  useEffect(() => {
    loadCohortsData();
  }, [refetchCounter]);

  const handleViewCohort = async (coh: Cohort) => {
    setSelectedCoh(coh);
    
    // Find matching college
    const matchedCol = colleges.find(c => c.id === coh.college_id);
    setSelectedCohCol(matchedCol || null);

    // Get founders & startups
    const founders = await dbService.getFoundersByCohort(coh.id);
    const startups = await dbService.getStartupsByCohort(coh.id);
    
    setSelectedCohFounders(founders);
    setSelectedCohStartups(startups);
    setCohortSearch('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohName || !newCohColId) return;

    await dbService.addCohort({
      college_id: newCohColId,
      name: newCohName,
      stage: newCohStage,
      start_date: newCohStartDate,
      total_weeks: newCohWeeks,
      current_week: 1,
      progress_pct: 12, // start progress
      status: 'Just started'
    });

    // Reset Form
    setNewCohName('');
    setShowAddModal(false);
    
    onRefetch();
    loadCohortsData();
  };

  // Filtering Cohorts on Stage
  const filteredCohorts = cohorts.filter(c => {
    if (stageFilter === 'All') return true;
    return c.stage === stageFilter;
  });

  return (
    <div className="flex flex-col gap-4 text-left text-[#1B2240]">
      
      {/* FILTER CONTROLS HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['All', 'Ideation', 'Validation', 'Prototype'].map(stage => (
            <button 
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                stageFilter === stage 
                  ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' 
                  : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'
              }`}
            >
              {stage === 'All' ? 'All Seasons' : stage}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans'] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Cohort</span>
        </button>
      </div>

      {/* COHORT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCohorts.map(coh => {
          const matchingCol = colleges.find(c => c.id === coh.college_id);
          return (
            <div 
              key={coh.id}
              onClick={() => handleViewCohort(coh)}
              className="bg-white border border-[#E2E5EC] rounded-[14px] p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-[#2DC5A2]/30 transition-all text-left flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-['Bricolage_Grotesque'] text-[14px] font-bold text-[#1B2240]">{coh.name}</h4>
                  <p className="text-[11px] text-[#8891B0] mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#cbd0dc]" />
                    <span>{matchingCol ? `${matchingCol.name} · ${matchingCol.city}` : 'India'}</span>
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                  coh.stage === 'Prototype' ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' :
                  coh.stage === 'Validation' ? 'bg-[#F5A623]/10 text-[#b45309]' : 'bg-[#3B82F6]/10 text-[#1d4ed8]'
                }`}>
                  {coh.stage}
                </span>
              </div>

              {/* Progress Bar Frame */}
              <div className="mt-1.5 w-full">
                <div className="w-full h-1.5 bg-[#F4F5F7] rounded-full overflow-hidden">
                  <div className="bg-[#2DC5A2] h-full rounded-full" style={{ width: `${coh.progress_pct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10.5px] text-[#8891B0] mt-1.5 font-bold">
                  <span>Week {coh.current_week} of {coh.total_weeks}</span>
                  <span className="text-[#2DC5A2]">{coh.progress_pct}% milestones completed</span>
                </div>
              </div>

              {/* Stats highlights */}
              <div className="flex gap-6 mt-2 pt-3 border-t border-[#F4F5F7]">
                <div>
                  <span className="block text-sm font-['Bricolage_Grotesque'] font-black text-[#1B2240]">
                    {matchingCol ? '24' : '—'}
                  </span>
                  <span className="text-[10px] uppercase text-[#8891B0] font-bold">Founders list</span>
                </div>
                <div>
                  <span className="block text-sm font-['Bricolage_Grotesque'] font-black text-[#1B2240]">
                    {coh.stage === 'Ideation' ? '11' : '8'}
                  </span>
                  <span className="text-[10px] uppercase text-[#8891B0] font-bold">Startups</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#1B2240] mt-0.5">
                    {coh.stage === 'Ideation' ? 'June 28' : 'June 14'}
                  </span>
                  <span className="text-[10px] uppercase text-[#8891B0] font-bold block">Next milestone</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COHORT DETAIL DRAWER VIEW */}
      {selectedCoh && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => setSelectedCoh(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-screen overflow-y-auto shadow-2xl flex flex-col p-6 text-left border-l border-[#E2E5EC] z-50">
            <button 
              onClick={() => setSelectedCoh(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-['Bricolage_Grotesque'] text-lg font-black text-[#1B2240]">
              {selectedCoh.name}
            </h3>
            <p className="text-xs text-[#8891B0] mt-1 flex items-center gap-1 leading-none">
              <MapPin className="w-3.5 h-3.5 text-[#cbd0dc]" />
              <span>{selectedCohCol ? `${selectedCohCol.name} · ${selectedCohCol.city}, ${selectedCohCol.state}` : 'Partner Campus'}</span>
            </p>

            {/* Local Search input */}
            <div className="mt-4 flex items-center gap-2 bg-[#F4F5F7] border border-[#E2E5EC] rounded-lg px-3 py-2 text-xs text-[#4A5270]">
              <Search className="w-3.5 h-3.5 text-[#8891B0] shrink-0" />
              <input 
                type="text" 
                value={cohortSearch}
                onChange={(e) => setCohortSearch(e.target.value)}
                placeholder="Search founders or startups..." 
                className="bg-transparent border-none text-xs outline-none w-full text-[#1B2240]"
              />
            </div>

            {/* Startups column */}
            <div className="mt-5 border-t border-[#F4F5F7] pt-4">
              <div className="text-[10.5px] uppercase text-[#8891B0] font-bold mb-3 tracking-wider">
                Startups Enrolled ({selectedCohStartups.length})
              </div>
              <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto pr-1">
                {selectedCohStartups
                  .filter(s => s.name.toLowerCase().includes(cohortSearch.toLowerCase()) || s.domain.toLowerCase().includes(cohortSearch.toLowerCase()))
                  .map(s => (
                    <div 
                      key={s.id} 
                      className="p-3 bg-white border border-[#E2E5EC] hover:border-[#CBD0DC] rounded-xl flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black rounded-lg text-[10px]">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1B2240]">{s.name}</div>
                          <div className="text-[10px] text-[#8891B0] mt-0.5">{s.domain} · Lead: {s.lead_founder}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 bg-[#2DC5A2]/10 text-[#1a8f74] rounded-full shrink-0">
                        {s.stage}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Founders list */}
            <div className="mt-5 border-t border-[#F4F5F7] pt-4 flex-1">
              <div className="text-[10.5px] uppercase text-[#8891B0] font-bold mb-3 tracking-wider">
                Founders Directory
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {selectedCohFounders
                  .filter(f => f.name.toLowerCase().includes(cohortSearch.toLowerCase()) || f.role.toLowerCase().includes(cohortSearch.toLowerCase()))
                  .map(f => (
                    <div 
                      key={f.id} 
                      className="p-3 bg-[#F4F5F7]/40 border border-[#E2E5EC] rounded-xl flex items-center justify-between text-left"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1B2240]">{f.name}</div>
                        <div className="text-[10px] text-[#8891B0] mt-0.5">{f.role}</div>
                      </div>
                      <div className="text-[10.5px] font-semibold text-[#4A5270]">
                        👥 Active
                      </div>
                    </div>
                  ))}
                {selectedCohFounders.length === 0 && (
                  <div className="p-4 text-center text-xs text-[#8891B0] bg-[#F4F5F7] rounded-xl">
                    No individual roster members loaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW COHORT CREATION MODAL */}
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
              <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1B2240]">Create Cohort Program</span>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Partner University</label>
                <select 
                  value={newCohColId}
                  onChange={(e) => setNewCohColId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Cohort Program Name</label>
                <input 
                  type="text" 
                  value={newCohName}
                  onChange={(e) => setNewCohName(e.target.value)}
                  placeholder="e.g. SRM Chennai — Winter Cohort 2026" 
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Development Stage</label>
                  <select 
                    value={newCohStage}
                    onChange={(e) => setNewCohStage(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="Ideation">Ideation</option>
                    <option value="Validation">Validation</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Validating">Validating</option>
                    <option value="Scaling">Scaling</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Start Date</label>
                  <input 
                    type="date" 
                    value={newCohStartDate}
                    onChange={(e) => setNewCohStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-5 py-2.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] cursor-pointer transition-all border-none"
            >
              Initialize Cohort Board
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
