import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, X, Eye, ShieldCheck, Mail, Users, Rocket } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { College, Cohort, Startup } from '../types';

interface CollegesPageProps {
  onRefetch: () => void;
  refetchCounter: number;
}

export default function CollegesPage({ onRefetch, refetchCounter }: CollegesPageProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Onboarding'>('All');

  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColCity, setNewColCity] = useState('');
  const [newColState, setNewColState] = useState('');
  const [newColStatus, setNewColStatus] = useState<'Active' | 'Onboarding'>('Active');
  const [newColCohort, setNewColCohort] = useState('Summer 2025');
  const [newColLead, setNewColLead] = useState('');

  // Drawer detail states
  const [selectedCol, setSelectedCol] = useState<College | null>(null);
  const [selectedColCohorts, setSelectedColCohorts] = useState<Cohort[]>([]);
  const [selectedColStartups, setSelectedColStartups] = useState<Startup[]>([]);

  const loadCollegesList = async () => {
    const list = await dbService.getColleges();
    setColleges(list);
  };

  useEffect(() => {
    loadCollegesList();
  }, [refetchCounter]);

  // Handle slide-out detail drawer loading
  const handleViewCollege = async (col: College) => {
    setSelectedCol(col);
    const cohs = await dbService.getCohortsByCollege(col.id);
    const sts = await dbService.getStartupsByCollege(col.id);
    setSelectedColCohorts(cohs);
    setSelectedColStartups(sts);
  };

  // Submit add form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName || !newColCity || !newColState || !newColLead) return;

    await dbService.addCollege({
      name: newColName,
      city: newColCity,
      state: newColState,
      status: newColStatus,
      cohort_name: newColCohort,
      core_team_lead: newColLead
    });

    // Reset fields
    setNewColName('');
    setNewColCity('');
    setNewColState('');
    setNewColLead('');
    setShowAddModal(false);

    onRefetch(); // update global counters
    loadCollegesList();
  };

  // Filter
  const filteredColleges = colleges.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-4 text-left text-[#1B2240]">
      {/* FILTER CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Status filtering chips */}
          <button 
            onClick={() => setStatusFilter('All')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${statusFilter === 'All' ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'}`}
          >
            All Campus Partners
          </button>
          <button 
            onClick={() => setStatusFilter('Active')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${statusFilter === 'Active' ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter('Onboarding')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${statusFilter === 'Onboarding' ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'}`}
          >
            Onboarding
          </button>
        </div>

        <div className="flex items-center gap-2 max-sm:w-full">
          <div className="flex items-center gap-2 bg-[#F4F5F7] border border-[#E2E5EC] rounded-lg px-3 py-1.5 text-xs text-[#4A5270] w-52 max-sm:w-full">
            <Search className="w-3.5 h-3.5 text-[#8891B0] shrink-0" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by college or city..." 
              className="bg-transparent border-none text-xs outline-none w-full text-[#1B2240]"
            />
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans'] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add College</span>
          </button>
        </div>
      </div>

      {/* COLLEGES DIRECTORY LIST TABLE */}
      <div className="bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E2E5EC] text-[#8891B0]">
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4 pl-6">Institution Partner</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Regional Hub Location</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Cohort Season</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Enrollments</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Lifecycle Status</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Liaison Contact Lead</th>
                <th className="text-[10.5px] font-bold uppercase tracking-wider p-4 pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7]">
              {filteredColleges.map((col, idx) => (
                <tr 
                  key={col.id} 
                  className="hover:bg-[#F4F5F7] transition-all"
                >
                  <td className="p-4 pl-6 font-bold text-xs text-[#1B2240]">
                    {col.name}
                  </td>
                  <td className="p-4 text-xs text-[#4A5270] font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#8891B0]" />
                      <span>{col.city}, {col.state}</span>
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#4A5270] font-semibold">
                    {col.cohort_name}
                  </td>
                  <td className="p-4 text-xs font-extrabold text-[#1B2240]">
                    {col.status === 'Onboarding' ? '—' : (20 + idx * 3)} Founders
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      col.status === 'Active' ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' : 'bg-[#E2E5EC] text-[#4A5270]'
                    }`}>
                      {col.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#4A5270] font-medium">
                    {col.core_team_lead}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <button 
                      onClick={() => handleViewCollege(col)}
                      className="px-2.5 py-1 bg-[#F4F5F7] border border-[#E2E5EC] hover:border-[#CBD0DC] hover:bg-white text-[11px] font-semibold rounded-md text-[#4A5270] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER VIEW MODAL SLIDE OUT */}
      {selectedCol && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => setSelectedCol(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-screen overflow-y-auto shadow-2xl flex flex-col p-6 text-left border-l border-[#E2E5EC] animate-slide-left z-50">
            <button 
              onClick={() => setSelectedCol(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-['Bricolage_Grotesque'] text-lg font-black text-[#1B2240] pr-6">
              {selectedCol.name}
            </h3>
            <p className="text-xs text-[#8891B0] mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedCol.city}, {selectedCol.state}</span>
            </p>

            {/* Quick stats board */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-[#F4F5F7] border border-[#E2E5EC] rounded-xl flex items-center gap-2.5">
                <Users className="w-4.5 h-4.5 text-[#2DC5A2]" />
                <div>
                  <div className="text-[9.5px] font-bold text-[#8891B0] uppercase">Active Cohorts</div>
                  <div className="text-sm font-black text-[#1B2240]">{selectedColCohorts.length}</div>
                </div>
              </div>
              <div className="p-3 bg-[#F4F5F7] border border-[#E2E5EC] rounded-xl flex items-center gap-2.5">
                <Rocket className="w-4.5 h-4.5 text-[#8B5CF6]" />
                <div>
                  <div className="text-[9.5px] font-bold text-[#8891B0] uppercase">Startups Portfolio</div>
                  <div className="text-sm font-black text-[#1B2240]">{selectedColStartups.length}</div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-5 border-t border-[#F4F5F7] pt-4 text-xs font-semibold text-[#1B2240]">
              <div className="text-[10px] uppercase text-[#8891B0] tracking-wider mb-2 font-bold">Primary Contacts</div>
              <div className="p-3 border border-[#E2E5EC] rounded-xl flex flex-col gap-1.5 bg-[#2DC5A2]/5">
                <div className="font-bold flex items-center gap-1 text-[#1B2240]">
                  <ShieldCheck className="w-4 h-4 text-[#2DC5A2]" />
                  <span>{selectedCol.core_team_lead} (Core Team Lead)</span>
                </div>
                <div className="text-[11px] text-[#4A5270] font-normal pl-5 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#8891B0]" />
                  <span>{selectedCol.name.toLowerCase().replace(' ', '')}@beaconpartner.in</span>
                </div>
              </div>
            </div>

            {/* Startups Portfolio section */}
            <div className="mt-5 border-t border-[#F4F5F7] pt-4 flex-1">
              <div className="text-[10px] uppercase text-[#8891B0] tracking-wider mb-3.5 font-bold flex items-center justify-between">
                <span>Startups Tracked</span>
                <span className="text-[10px] text-[#2DC5A2] font-black italic bg-[#2DC5A2]/10 px-2 py-0.5 rounded-full">{selectedColStartups.length} live</span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                {selectedColStartups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8891B0] bg-[#F4F5F7] rounded-xl">No startups in this season yet</div>
                ) : (
                  selectedColStartups.map(su => (
                    <div 
                      key={su.id} 
                      className="p-3 border border-[#E2E5EC] hover:border-[#CBD0DC] rounded-xl flex items-center gap-3 bg-white"
                    >
                      <div className="w-7 h-7 rounded bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black text-[10.5px]">
                        {su.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#1B2240] truncate">{su.name}</div>
                        <div className="text-[10.5px] text-[#8891B0] mt-0.5 truncate">{su.domain} · Lead founder: {su.lead_founder}</div>
                      </div>
                      <span className="text-[9.5px] font-extrabold px-2 py-0.5 bg-[#2DC5A2]/10 text-[#1a8f74] rounded-full shrink-0">
                        {su.stage}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD COLLEGE FORM MODAL */}
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
              <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1B2240]">Register Campus Partner</span>
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
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">University/College Name</label>
                <input 
                  type="text" 
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. MIT Manipal, VJTI Mumbai" 
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">City</label>
                  <input 
                    type="text" 
                    value={newColCity}
                    onChange={(e) => setNewColCity(e.target.value)}
                    placeholder="e.g. Manipal" 
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">State</label>
                  <input 
                    type="text" 
                    value={newColState}
                    onChange={(e) => setNewColState(e.target.value)}
                    placeholder="e.g. Karnataka" 
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Core Team Lead</label>
                  <input 
                    type="text" 
                    value={newColLead}
                    onChange={(e) => setNewColLead(e.target.value)}
                    placeholder="e.g. Rohan Sharma" 
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Lifecycle status</label>
                  <select 
                    value={newColStatus}
                    onChange={(e) => setNewColStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-5 py-2.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] cursor-pointer transition-all border-none"
            >
              Add Partner University
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
