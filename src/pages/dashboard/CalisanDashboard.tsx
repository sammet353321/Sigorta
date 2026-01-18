import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { Search, Download, Check, X, Eye, FileText, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';

type Quote = Database['public']['Tables']['quotes']['Row'];

export default function CalisanDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  
  // Policy Creation Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [policyForm, setPolicyForm] = useState({
    policy_number: '',
    start_date: '',
    end_date: ''
  });
  const [creatingPolicy, setCreatingPolicy] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, [filter]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quotes')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchQuotes();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  const openPolicyModal = (quote: Quote) => {
    setSelectedQuote(quote);
    // Set default dates
    const start = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    
    setPolicyForm({
      policy_number: '',
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    });
    setShowPolicyModal(true);
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    
    setCreatingPolicy(true);
    try {
      // 1. Create Policy
      const { error: policyError } = await supabase
        .from('policies')
        .insert({
          quote_id: selectedQuote.id,
          user_id: selectedQuote.user_id,
          policy_number: policyForm.policy_number,
          start_date: policyForm.start_date,
          end_date: policyForm.end_date,
          status: 'active'
        });

      if (policyError) throw policyError;

      // 2. Update Quote with Policy Number (optional but good for reference)
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ policy_number: policyForm.policy_number })
        .eq('id', selectedQuote.id);

      if (quoteError) throw quoteError;

      alert('Poliçe başarıyla oluşturuldu.');
      setShowPolicyModal(false);
      fetchQuotes();
    } catch (error: any) {
      console.error('Error creating policy:', error);
      alert('Poliçe oluşturulurken hata: ' + error.message);
    } finally {
      setCreatingPolicy(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = quotes.map(q => ({
      'AD SOYAD': q.full_name,
      'DOĞUM TARİHİ': q.birth_date,
      'ŞİRKET': q.company,
      'TARİH': new Date(q.date).toLocaleDateString('tr-TR'),
      'ŞASİ': q.chassis_number,
      'PLAKA': q.plate_number,
      'TC/VKN': q.identity_number,
      'BELGE NO': q.document_number,
      'ARAÇ CİNSİ': q.vehicle_type,
      'BRÜT PRİM': q.gross_premium,
      'TÜR': q.type,
      'KESEN': q.issuer,
      'İLGİLİ KİŞİ': q.related_person,
      'POLİÇE NO': q.policy_number,
      'ACENTE': q.agency,
      'KART': q.card_info,
      'EK BİLGİLER / İLETİŞİM': q.additional_info,
      'NET PRİM': q.net_premium,
      'KOMİSYON': q.commission
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teklifler');
    
    // Auto-size columns
    const maxWidth = 20; 
    worksheet['!cols'] = Object.keys(dataToExport[0] || {}).map(() => ({ wch: maxWidth }));
    
    XLSX.writeFile(workbook, 'teklifler.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Teklif Havuzu</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Excel İndir</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyenler' : f === 'approved' ? 'Onaylananlar' : 'Reddedilenler'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ara..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Kayıt bulunamadı
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quote.full_name}</div>
                      <div className="text-sm text-gray-500">{quote.identity_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quote.plate_number}</div>
                      <div className="text-sm text-gray-500">{quote.vehicle_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.gross_premium ? `₺${quote.gross_premium}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quote.status === 'pending' ? 'Beklemede' : quote.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {quote.document_url && (
                          <a 
                            href={quote.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900" 
                            title="Belgeyi Görüntüle"
                          >
                            <FileText className="w-5 h-5" />
                          </a>
                        )}
                        
                        {quote.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(quote.id, 'approved')}
                              className="text-green-600 hover:text-green-900" 
                              title="Onayla"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                              className="text-red-600 hover:text-red-900" 
                              title="Reddet"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {quote.status === 'approved' && !quote.policy_number && (
                          <button
                            onClick={() => openPolicyModal(quote)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Poliçe Oluştur"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Policy Modal */}
      {showPolicyModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Poliçe Oluştur</h2>
            <div className="mb-4 text-sm text-gray-600">
              <p>Müşteri: {selectedQuote.full_name}</p>
              <p>Plaka: {selectedQuote.plate_number}</p>
            </div>
            
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poliçe No</label>
                <input
                  type="text"
                  required
                  value={policyForm.policy_number}
                  onChange={e => setPolicyForm({...policyForm, policy_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="POL-2024-..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    required
                    value={policyForm.start_date}
                    onChange={e => setPolicyForm({...policyForm, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    required
                    value={policyForm.end_date}
                    onChange={e => setPolicyForm({...policyForm, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creatingPolicy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingPolicy ? 'Oluşturuluyor...' : 'Poliçe Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
