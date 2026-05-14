import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SafeIcon } from "../../../components/SafeIcon";

interface IncidentTableProps {
  data: any[];
  title?: string;
  showViewAll?: boolean;
  itemsPerPage?: number;
  showActions?: boolean;
  showTechnician?: boolean;
}

export default function IncidentTable({ 
  data, 
  title = "Assigned Complaints", 
  showViewAll = true, 
  itemsPerPage = 10,
  showActions = true,
  showTechnician = false
}: IncidentTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h2>
        {showViewAll && (
          <button 
            onClick={() => navigate("/vendor/assigned")}
            className="text-blue-600 text-xs font-bold hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Issue Category</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
              {showTechnician && <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Technician</th>}
              {showActions && <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">#{item.id}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    item.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-100' : 
                    item.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    item.status === 'ASSIGNED_TO_VENDOR' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-green-50 text-green-700 border-green-100'
                  }`}>
                    {item.status?.replace('_', ' ') || item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{item.issueCategory}</td>
                <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{item.description || item.issueDescription || 'No description provided'}</td>
                {showTechnician && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.technicianName || item.technicianId ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={`text-xs font-medium ${item.technicianName || item.technicianId ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {item.technicianName || (item.technicianId ? `Tech #${item.technicianId}` : 'Unassigned')}
                      </span>
                    </div>
                  </td>
                )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/vendor/incident/${item.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        <SafeIcon name="Eye" className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button 
                        onClick={() => navigate(`/vendor/assign/${item.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <SafeIcon name="UserPlus" className="w-3.5 h-3.5" />
                        Assign
                      </button>
                    </div>
                  </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5 + (showTechnician ? 1 : 0) - (showActions ? 0 : 1)} className="px-6 py-10 text-center text-slate-400">
                  No incidents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Showing {startIndex + 1} - {Math.min(endIndex, data.length)} of {data.length} results
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SafeIcon name="ChevronLeft" className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-brand-blue text-white shadow-md'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SafeIcon name="ChevronRight" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
