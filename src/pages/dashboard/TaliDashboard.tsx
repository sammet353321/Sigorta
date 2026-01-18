import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../types/supabase';
import { Plus, Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type Quote = Database['public']['Tables']['quotes']['Row'];

export default function TaliDashboard() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tekliflerim</h1>
        <Link
          to="/quotes/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Teklif</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tekliflerde ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => (
          <div key={quote.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(quote.status)}`}>
                {getStatusIcon(quote.status)}
                <span className="capitalize">{quote.status === 'pending' ? 'Beklemede' : quote.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(quote.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">{quote.full_name}</h3>
            <p className="text-sm text-gray-600 mb-2">{quote.vehicle_type} - {quote.plate_number}</p>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <span className="text-sm font-medium text-gray-900">
                {quote.gross_premium ? `₺${quote.gross_premium}` : '-'}
              </span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Detaylar
              </button>
            </div>
          </div>
        ))}
        
        {quotes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Henüz teklif yok</h3>
            <p className="text-gray-500 mt-1">Yeni bir teklif oluşturarak başlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
}
