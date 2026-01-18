import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import { Upload, X, Loader2, Save } from 'lucide-react';

export default function CreateQuote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    full_name: '',
    identity_number: '',
    plate_number: '',
    vehicle_type: '',
    product_type: 'Trafik', // default
    company: '',
    chassis_number: '',
    document_number: '',
    additional_info: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (max 500KB)
      if (selectedFile.size > 500 * 1024) {
        alert('Dosya boyutu 500KB\'dan büyük olamaz.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create Quote Record
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          identity_number: formData.identity_number,
          plate_number: formData.plate_number,
          vehicle_type: formData.vehicle_type,
          // Mapping product_type to 'type' field in schema
          type: formData.product_type,
          company: formData.company,
          chassis_number: formData.chassis_number,
          document_number: formData.document_number,
          additional_info: formData.additional_info,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // 2. Upload Document if exists
      if (file && quote) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${quote.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Update quote with document URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        await supabase
          .from('quotes')
          .update({
            document_url: publicUrl,
            document_uploaded_at: new Date().toISOString()
          })
          .eq('id', quote.id);
      }

      // 3. Log Activity
      await logActivity(user.id, 'quote_created', 'quote', quote.id, {
        plate: formData.plate_number,
        product: formData.product_type
      });

      navigate('/dashboard/tali');
    } catch (error: any) {
      console.error('Error creating quote:', error);
      alert('Teklif oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Teklif Oluştur</h1>
        <button
          onClick={() => navigate('/dashboard/tali')}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Müşteri Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Müşteri Bilgileri</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TC / VKN</label>
              <input
                type="text"
                name="identity_number"
                required
                value={formData.identity_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket (Opsiyonel)</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Araç Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Araç Bilgileri</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaka</label>
              <input
                type="text"
                name="plate_number"
                required
                value={formData.plate_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruhsat / Belge No</label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şasi No</label>
              <input
                type="text"
                name="chassis_number"
                value={formData.chassis_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sigorta Detayları */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Sigorta Detayları</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tipi</label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Trafik">Trafik Sigortası</option>
                <option value="Kasko">Kasko</option>
                <option value="DASK">DASK</option>
                <option value="Konut">Konut Sigortası</option>
                <option value="Saglik">Sağlık Sigortası</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Araç Cinsi</label>
              <input
                type="text"
                name="vehicle_type"
                placeholder="Otomobil, Kamyonet vb."
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ek Bilgiler</label>
            <textarea
              name="additional_info"
              rows={3}
              value={formData.additional_info}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Belge Yükleme */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Belge Yükleme</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                {file ? file.name : 'Dosya yüklemek için tıklayın veya sürükleyin'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF veya Resim (Max 500KB)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Teklifi Kaydet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
