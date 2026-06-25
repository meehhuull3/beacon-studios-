import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, X, Search, FileSignature, Presentation, Table, FileSpreadsheet, FolderClosed } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { Document as AppDocument, College, User } from '../types';

interface DocumentsPageProps {
  onRefetch: () => void;
  refetchCounter: number;
  currentUser: User;
}

export default function DocumentsPage({ onRefetch, refetchCounter, currentUser }: DocumentsPageProps) {
  const isBI = currentUser.portal === 'bi';
  const collegeId = currentUser.college_id;

  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  // Upload Form Modal States
  const [showUploadModal, setShowAddModal] = useState(false);
  const [newDocType, setNewDocType] = useState<AppDocument['type']>('Template');
  const [newColId, setNewColId] = useState<string>('all');
  const [fileObject, setFileObject] = useState<File | null>(null);

  const loadDocuments = async () => {
    const list = await dbService.getDocuments();
    const cols = await dbService.getColleges();

    // Filter documents depending on context
    const allowed = isBI 
      ? list 
      : list.filter(d => d.college_id === null || d.college_id === collegeId);

    setDocuments(allowed);
    setColleges(cols);
  };

  useEffect(() => {
    loadDocuments();
  }, [refetchCounter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileObject(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileObject) return;

    // Create a local executable download link using object relative urls!
    const fileUrl = URL.createObjectURL(fileObject);
    const sizeStr = (fileObject.size / (1024 * 1024)).toFixed(1) + ' MB';

    await dbService.addDocument({
      college_id: newColId === 'all' ? null : newColId,
      name: fileObject.name,
      type: newDocType,
      size: sizeStr,
      file_url: fileUrl,
      uploaded_by: currentUser.name
    });

    setFileObject(null);
    setShowAddModal(false);

    onRefetch();
    loadDocuments();
  };

  const getDocIcon = (type: AppDocument['type']) => {
    switch (type) {
      case 'Template': return PresetIcon(FileSpreadsheet, 'bg-blue-50 text-blue-500 border-blue-100');
      case 'MoU': return PresetIcon(FileSignature, 'bg-amber-50 text-amber-500 border-amber-100');
      case 'Deck': return PresetIcon(Presentation, 'bg-[#2DC5A2]/10 text-[#1a8f74] border-[#2DC5A2]/20');
      case 'Report': return PresetIcon(Table, 'bg-red-50 text-red-500 border-red-100');
      case 'Playbook': return PresetIcon(FileText, 'bg-purple-50 text-purple-500 border-purple-100');
      default: return PresetIcon(FileText, 'bg-[#F4F5F7]');
    }
  };

  function PresetIcon(IconComponent: any, classes: string) {
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold shrink-0 ${classes}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  }

  // Filter list
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' ? true : d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-4 text-left text-[#1B2240]">
      
      {/* ACTION TABS & UPLOAD BUTTON */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-sm:w-full">
          {['All', 'Templates', 'MoUs', 'Decks', 'Reports'].map(fName => {
            const val = fName === 'All' ? 'All' : fName.substring(0, fName.length - 1); // convert back e.g. Templates -> Template
            return (
              <button
                key={fName}
                onClick={() => setTypeFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                  (val === 'All' && typeFilter === 'All') || typeFilter === val
                    ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' 
                    : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'
                }`}
              >
                {fName}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 max-sm:w-full">
          <div className="flex items-center gap-2 bg-[#F4F5F7] border border-[#E2E5EC] rounded-lg px-3 py-1.5 text-xs text-[#4A5270] w-48 max-sm:w-full">
            <Search className="w-3.5 h-3.5 text-[#8891B0] shrink-0" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..." 
              className="bg-transparent border-none text-xs outline-none w-full text-[#1B2240]"
            />
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans'] transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Recent document lists */}
        <div className="lg:col-span-8 bg-white border border-[#E2E5EC] rounded-[14px] p-5 shadow-sm">
          <div className="border-b border-[#F4F5F7] pb-3 mb-4">
            <h4 className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Resource Document Vault</h4>
          </div>

          <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto">
            {filteredDocs.map(doc => {
              const matchedCollege = colleges.find(c => c.id === doc.college_id);
              
              return (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    {getDocIcon(doc.type)}
                    <div className="text-left">
                      <div className="text-xs font-bold text-[#1B2240]">{doc.name}</div>
                      <div className="text-[10px] text-[#8891B0] mt-0.5">
                        Uploaded by {doc.uploaded_by} · {doc.size} · Scope: {matchedCollege ? matchedCollege.name : 'Global Resource'}
                      </div>
                    </div>
                  </div>

                  <a 
                    href={doc.file_url === '#' ? undefined : doc.file_url}
                    download={doc.name}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[#E2E5EC] hover:border-[#cbd0dc] rounded-lg text-xs font-bold text-[#4A5270] hover:bg-[#F4F5F7] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8891B0]">No documents match the list category query</div>
            )}
          </div>
        </div>

        {/* Categories / Vault section cards */}
        <div className="lg:col-span-4 bg-white border border-[#E2E5EC] rounded-[14px] p-5 shadow-sm text-left">
          <div className="border-b border-[#F4F5F7] pb-3 mb-4 flex items-center justify-between">
            <h4 className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Vault Directories</h4>
            <FolderClosed className="w-4 h-4 text-[#8891B0]" />
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              ['Ideation milestone', '6 templates · 3 playbooks · 2 guides'],
              ['Validation checklists', '4 templates · 5 playbooks · Interview scripts'],
              ['Technical prototype stage', 'Pitch decks · MVP checklist · Demo guides'],
              ['Compliance and legally MoUs', 'MoU templates · IP agreements · DPIIT framework'],
            ].map(([dirName, childLabels]) => (
              <div 
                key={dirName}
                className="bg-[#F4F5F7] hover:bg-[#F0F2F5] hover:border-[#CBD0DC] cursor-pointer rounded-xl p-3 border border-[#E2E5EC] transition-all"
              >
                <div className="text-xs font-bold text-[#1B2240]">{dirName}</div>
                <div className="text-[10px] text-[#8891B0] mt-1 font-semibold">{childLabels}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* UPLOAD FILE MODAL BOX */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => setShowAddModal(false)}
          />
          <form 
            onSubmit={handleUploadSubmit}
            className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-left border border-[#E2E5EC] z-50 animate-[fadeIn_0.15s_ease]"
          >
            <div className="flex items-center justify-between border-b border-[#E2E5EC] pb-3.5 mb-4">
              <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1B2240]">Upload Resource to Vault</span>
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
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">File Object</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="w-full px-3 py-3 border-2 border-dashed border-[#E2E5EC] rounded-lg text-xs outline-none bg-[#F4F5F7] text-[#1B2240] file:mr-2.5 file:px-3 file:py-1 file:bg-[#1B2240] file:text-white file:border-none file:rounded-md file:text-[10px] file:font-semibold cursor-pointer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Asset Category</label>
                  <select 
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="Template">Template spreadsheet</option>
                    <option value="MoU">Legal MoU contract</option>
                    <option value="Deck">Pitch Presentation Deck</option>
                    <option value="Report">Operational Report</option>
                    <option value="Playbook">Playbook Framework</option>
                  </select>
                </div>

                {isBI && (
                  <div>
                    <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">College Scope Limit</label>
                    <select 
                      value={newColId}
                      onChange={(e) => setNewColId(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    >
                      <option value="all">Global (All Campus Partners)</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-5 py-2.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] cursor-pointer transition-all border-none"
            >
              Confirm and Store File
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
