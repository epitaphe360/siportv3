import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Crown, 
  Search, 
  Download, 
  Calendar, 
  Mail, 
  Building2, 
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface VIPVisitor {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  created_at: string;
  visitor_level: string;
  profile?: {
    country?: string;
    phone?: string;
  };
  payments?: {
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }[];
}

export default function VIPVisitorsPage() {
  const { t } = useTranslation();
  const [visitors, setVisitors] = useState<VIPVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVIPVisitors();
  }, []);

  const fetchVIPVisitors = async () => {
    setLoading(true);
    try {
      // 1. Fetch VIP Users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'visitor')
        .in('visitor_level', ['premium', 'vip'])
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // 2. Fetch Payment info for these users
      const userIds = usersData.map(u => u.id);
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_requests')
        .select('*')
        .in('user_id', userIds)
        .eq('status', 'approved'); // Only success payments

      if (paymentsError) {
        console.warn('Could not fetch payments', paymentsError);
      }

      // 3. Merge Data
      const mergedData = usersData.map(user => {
        const userPayments = paymentsData?.filter(p => p.user_id === user.id) || [];
        // Sort payments by date desc
        userPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          id: user.id,
          name: user.name || 'N/A',
          email: user.email,
          company: user.profile?.company,
          position: user.profile?.position,
          created_at: user.created_at,
          visitor_level: user.visitor_level,
          profile: user.profile,
          payments: userPayments
        };
      });

      setVisitors(mergedData);
    } catch (error) {
      console.error('Error fetching VIP visitors:', error);
      toast.error('Erreur lors du chargement des visiteurs VIP');
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Nom', 'Email', 'Société', 'Poste', 'Date Inscription', 'Niveau', 'Paiement', 'Montant', 'Date Paiement'];
    const csvContent = [
      headers.join(';'),
      ...filteredVisitors.map(v => {
        const lastPayment = v.payments?.[0];
        return [
          `"${v.name}"`,
          `"${v.email}"`,
          `"${v.company || ''}"`,
          `"${v.position || ''}"`,
          `"${new Date(v.created_at).toLocaleDateString()}"`,
          `"${v.visitor_level}"`,
          `"${lastPayment ? lastPayment.status : 'N/A'}"`,
          `"${lastPayment ? `${lastPayment.amount} ${lastPayment.currency}` : ''}"`,
          `"${lastPayment ? new Date(lastPayment.created_at).toLocaleDateString() : ''}"`
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vip_visitors_siport2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
              <span className="bg-yellow-100 p-2 rounded-lg">
                <Crown className="h-8 w-8 text-yellow-600" />
              </span>
              Gestion des Visiteurs VIP
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Liste complète des visiteurs Premium/VIP avec statut de paiement et détails.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-yellow-800 truncate">Total VIPs</dt>
                    <dd className="text-3xl font-bold text-yellow-900">{visitors.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-green-800 truncate">Paiements Validés</dt>
                    <dd className="text-3xl font-bold text-green-900">
                      {visitors.filter(v => v.payments && v.payments.length > 0).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
           <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-800 truncate">Nouveaux (30j)</dt>
                    <dd className="text-3xl font-bold text-blue-900">
                      {visitors.filter(v => {
                        const date = new Date(v.created_at);
                        const monthAgo = new Date();
                        monthAgo.setDate(monthAgo.getDate() - 30);
                        return date >= monthAgo;
                      }).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and List */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visiteur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Société / Poste
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Inscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut Paiement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails Transaction
                  </th>
                  {/* <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      Chargement des données...
                    </td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      Aucun visiteur VIP trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <motion.tr 
                      key={visitor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                             {visitor.profile?.photoUrl ? (
                               <img className="h-10 w-10 rounded-full object-cover" src={visitor.profile.photoUrl} alt="" />
                             ) : (
                               <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                 <span className="text-yellow-800 font-bold text-sm">
                                   {visitor.name.charAt(0).toUpperCase()}
                                 </span>
                               </div>
                             )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {visitor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                           <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                           {visitor.company || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{visitor.position || 'Visiteur'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visitor.created_at).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {visitor.payments && visitor.payments.length > 0 ? (
                           <Badge variant="success" className="items-center">
                             <CheckCircle className="h-3 w-3 mr-1" /> Paid
                           </Badge>
                        ) : (
                           <Badge variant="warning">
                             En attente
                           </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.payments && visitor.payments.length > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {visitor.payments[0].amount} {visitor.payments[0].currency}
                            </span>
                            <span className="text-xs">
                              {new Date(visitor.payments[0].created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Aucune transaction</span>
                        )}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td> */}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}