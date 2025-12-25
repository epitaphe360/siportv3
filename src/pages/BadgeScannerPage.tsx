import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  User,
  Building,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import useAuthStore from '../store/authStore';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannedBadge {
  id: string;
  badgeCode: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  avatarUrl?: string; // Photo du visiteur pour vérification d'identité
  userType: 'visitor' | 'exhibitor' | 'partner' | 'admin';
  userLevel?: string;
  accessLevel: string;
  validUntil: string;
  status: 'active' | 'expired' | 'revoked';
  scanCount: number;
  scannedAt: Date;
}

interface ScanStats {
  totalScans: number;
  todayScans: number;
  uniqueVisitors: number;
  lastScanTime?: Date;
}

export default function BadgeScannerPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBadge, setScannedBadge] = useState<ScannedBadge | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedBadge[]>([]);
  const [stats, setStats] = useState<ScanStats>({
    totalScans: 0,
    todayScans: 0,
    uniqueVisitors: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef<boolean>(false); // Protection contre scans multiples

  // Charger les stats et vérifier les permissions caméra au montage
  useEffect(() => {
    checkCameraPermission();
    loadScanStats();

    return () => {
      stopScanner();
    };
  }, []);

  /**
   * Charge les statistiques de scan depuis la base de données
   */
  const loadScanStats = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      // 1. Total des scans = somme de tous les scan_count
      const { data: allBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('scan_count, last_scanned_at, created_at');
      
      if (badgesError) {
        console.error('Erreur chargement stats:', badgesError);
        return;
      }

      // 2. Calculer les stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let totalScans = 0;
      let uniqueVisitors = 0;
      let todayScans = 0;
      let lastScanTime: Date | undefined;

      if (allBadges && allBadges.length > 0) {
        // Total scans = somme de tous les scan_count
        totalScans = allBadges.reduce((sum, b) => sum + (b.scan_count || 0), 0);
        
        // Visiteurs uniques = badges avec au moins 1 scan
        uniqueVisitors = allBadges.filter(b => (b.scan_count || 0) > 0).length;
        
        // Pour todayScans, on doit compter les scans faits aujourd'hui
        // Comme on n'a que last_scanned_at, on compte les badges scannés aujourd'hui
        // Note: Pour avoir le vrai nombre de scans aujourd'hui, il faudrait une table scan_logs
        const scannedToday = allBadges.filter(b => {
          if (!b.last_scanned_at) return false;
          const scanDate = new Date(b.last_scanned_at);
          return scanDate >= today;
        });
        todayScans = scannedToday.length;

        // Dernier scan
        const sortedByLastScan = allBadges
          .filter(b => b.last_scanned_at)
          .sort((a, b) => new Date(b.last_scanned_at!).getTime() - new Date(a.last_scanned_at!).getTime());
        
        if (sortedByLastScan.length > 0) {
          lastScanTime = new Date(sortedByLastScan[0].last_scanned_at!);
        }
      }

      setStats({
        totalScans,
        todayScans,
        uniqueVisitors,
        lastScanTime
      });
      
      console.log('Stats chargées:', { totalScans, todayScans, uniqueVisitors });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  /**
   * Vérifie les permissions caméra
   */
  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);

      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (err) {
      console.warn('Permission API not supported:', err);
      setCameraPermission('prompt');
    }
  };

  /**
   * Démarre le scanner QR
   */
  const startScanner = async () => {
    try {
      setError(null);

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Initialiser Html5Qrcode
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Démarrer le scan avec paramètres optimisés pour écran de téléphone
      await scanner.start(
        { facingMode: 'environment' }, // Caméra arrière
        {
          fps: 15, // Plus rapide pour meilleure réactivité
          qrbox: { width: 280, height: 280 }, // Zone de scan plus grande
          aspectRatio: 1.0, // Format carré optimal pour QR codes
          disableFlip: false // Permet de scanner QR codes inversés/miroir
        },
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
      toast.success('Scanner activé');
    } catch (err: any) {
      console.error('Erreur dÃ©marrage scanner:', err);
      toast.error('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      toast.error('Erreur caméra', {
        description: 'Vérifiez que votre navigateur a accès à la caméra.'
      });

      if (err.name === 'NotAllowedError') {
        setCameraPermission('denied');
      }
    }
  };

  /**
   * Arrête le scanner QR
   */
  const stopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
        toast.info('Scanner désactivé');
      }
    } catch (err) {
      console.error('Erreur arrêt scanner:', err);
    }
  };

  /**
   * Callback succès scan QR - AVEC PROTECTION ANTI-DOUBLON
   */
  const onScanSuccess = async (decodedText: string) => {
    // Protection contre les scans multiples
    if (isProcessingRef.current) {
      console.log('Scan ignoré - traitement en cours');
      return;
    }
    
    // Bloquer immédiatement les nouveaux scans
    isProcessingRef.current = true;
    console.log('QR Code scanné:', decodedText);

    // Arrêter le scanner IMMÉDIATEMENT
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      }
    } catch (e) {
      console.error('Erreur arrêt scanner:', e);
    }

    try {
      // Parser le QR code (format JSON attendu)
      let badgeData: any;
      try {
        badgeData = JSON.parse(decodedText);
      } catch {
        // Si ce n'est pas du JSON, considérer comme badge_code simple
        badgeData = { badge_code: decodedText };
      }

      // Valider le badge via l'API
      await validateAndRecordScan(badgeData.badge_code || decodedText);
      
      // Succès: recharger les stats depuis la DB
      await loadScanStats();
      
    } catch (err: any) {
      console.error('Erreur traitement scan:', err);
      toast.error('Badge invalide', {
        description: err.message || 'Impossible de valider ce badge'
      });
    } finally {
      // Débloquer après 1 seconde pour éviter les doubles scans accidentels
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };

  /**
   * Callback erreur scan QR
   */
  const onScanError = (errorMessage: string) => {
    // Ignorer les erreurs "No QR code found" (normales pendant le scan)
    if (!errorMessage.includes('No QR code found')) {
      console.warn('Scan error:', errorMessage);
    }
  };

  /**
   * Valide et enregistre un scan de badge
   */
  const validateAndRecordScan = async (badgeCode: string) => {
    try {
      const { supabase } = await import('../lib/supabase');

      // Appeler la fonction scan_badge qui valide et incrémente le compteur
      const { data, error } = await supabase.rpc('scan_badge', {
        p_badge_code: badgeCode
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Badge non trouvé');
      }

      // Créer l'objet badge scanné
      const scanned: ScannedBadge = {
        id: data.id,
        badgeCode: data.badge_code,
        fullName: data.full_name,
        companyName: data.company_name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatar_url, // Photo pour vérification d'identité
        userType: data.user_type,
        userLevel: data.user_level,
        accessLevel: data.access_level,
        validUntil: data.valid_until,
        status: data.status,
        scanCount: data.scan_count,
        scannedAt: new Date()
      };

      // Mettre à jour l'état
      setScannedBadge(scanned);
      setScanHistory(prev => [scanned, ...prev.slice(0, 49)]); // Garder les 50 derniers

      // Note: Les stats sont rechargées depuis la DB dans onScanSuccess

      // Notification sonore et visuelle
      playSuccessSound();
      toast.success('Badge validé', {
        description: `${scanned.fullName} - ${scanned.companyName || 'N/A'}`
      });

      // Enregistrer le lead si l'utilisateur est un exposant/partenaire
      if (user && (user.type === 'exhibitor' || user.type === 'partner')) {
        await recordLead(user.id, scanned);
      }
    } catch (err: any) {
      console.error('Erreur validation badge:', err);
      playErrorSound();

      // Messages d'erreur spÃ©cifiques
      if (err.message.includes('expired')) {
        toast.error('Badge expiré', {
          description: 'Ce badge n\'est plus valide'
        });
      } else if (err.message.includes('not active')) {
        toast.error('Badge inactif', {
          description: 'Ce badge a été révoqué ou n\'est pas actif'
        });
      } else {
        toast.error('Badge invalide', {
          description: err.message
        });
      }

      throw err;
    }
  };

  /**
   * Enregistre un lead pour les exposants/partenaires
   */
  const recordLead = async (scannerId: string, badge: ScannedBadge) => {
    try {
      const { supabase } = await import('../lib/supabase');

      await supabase.from('leads').insert({
        user_id: scannerId,
        visitor_id: badge.id,
        visitor_name: badge.fullName,
        visitor_email: badge.email,
        visitor_company: badge.companyName,
        visitor_phone: badge.phone,
        source: 'badge_scan',
        status: 'new',
        created_at: new Date().toISOString()
      });

      console.log('Lead enregistré:', badge.fullName);
    } catch (err) {
      console.error('Erreur enregistrement lead:', err);
      // Ne pas bloquer le scan si l'enregistrement du lead échoue
    }
  };

  /**
   * Sons de feedback
   */
  const playSuccessSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTWO1vPReSwF');
    audio.volume = 0.3;
    audio.play().catch(console.warn);
  };

  const playErrorSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgYCBgICAgYCAgYCBgICBgYGAgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgQ==');
    audio.volume = 0.2;
    audio.play().catch(console.warn);
  };

  /**
   * Reset du badge scanné (pour en scanner un autre)
   */
  const resetScannedBadge = () => {
    setScannedBadge(null);
    if (!isScanning) {
      startScanner();
    }
  };

  /**
   * Rendu de la badge scanné
   */
  const renderScannedBadge = (badge: ScannedBadge) => {
    const isValid = badge.status === 'active' && new Date(badge.validUntil) > new Date();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Card className={`p-6 ${isValid ? 'border-green-500' : 'border-red-500'} border-2`}>
          <div className="text-center mb-6">
            {/* Photo du visiteur pour vérification d'identité */}
            {badge.avatarUrl ? (
              <img 
                src={badge.avatarUrl} 
                alt={badge.fullName}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            {isValid ? (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            )}
            <h3 className="text-2xl font-bold mb-1">
              {isValid ? 'Badge Validé' : 'Badge Non Valide'}
            </h3>
            <p className="text-gray-600">{badge.badgeCode}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-semibold">{badge.fullName}</div>
                <div className="text-sm text-gray-600">{badge.email}</div>
              </div>
            </div>

            {badge.companyName && (
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div className="font-medium">{badge.companyName}</div>
              </div>
            )}

            {badge.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>{badge.phone}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Badge variant={isValid ? 'success' : 'error'}>
                  {badge.accessLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Scan #{badge.scanCount}
              </div>
            </div>
          </div>

          <Button
            variant="default"
            className="w-full mt-6"
            onClick={resetScannedBadge}
          >
            Scanner un autre badge
          </Button>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <QrCode className="h-8 w-8 mr-3" />
            Scanner de Badges
          </h1>
          <p className="text-gray-600 mt-2">
            Scannez les badges QR code des participants
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalScans}</div>
                <div className="text-sm text-gray-600">Total scans</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.todayScans}</div>
                <div className="text-sm text-gray-600">Aujourd'hui</div>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
                <div className="text-sm text-gray-600">Visiteurs uniques</div>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">
                  {stats.lastScanTime ? new Date(stats.lastScanTime).toLocaleTimeString('fr-FR') : '--:--'}
                </div>
                <div className="text-sm text-gray-600">Dernier scan</div>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Scanner</h2>

              {cameraPermission === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>Accès caméra refusé.</strong> Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}

              {/* Scanner Video */}
              <div
                id="qr-reader"
                ref={videoRef}
                className="w-full aspect-square bg-black rounded-lg overflow-hidden mb-4"
              />

              {/* Scanner Controls */}
              <div className="flex space-x-3">
                {!isScanning ? (
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={startScanner}
                    disabled={cameraPermission === 'denied'}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Activer le scanner
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={stopScanner}
                  >
                    Arrêter le scanner
                  </Button>
                )}
              </div>
            </Card>

            {/* Scanned Badge Display */}
            <AnimatePresence>
              {scannedBadge && (
                <div className="mt-6">
                  {renderScannedBadge(scannedBadge)}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* History Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Historique des scans</h2>

              {scanHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun badge scanné</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {scanHistory.map((badge, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{badge.fullName}</div>
                          <div className="text-sm text-gray-600">{badge.companyName || 'N/A'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {badge.scannedAt.toLocaleTimeString('fr-FR')}
                          </div>
                        </div>
                        <Badge variant={badge.status === 'active' ? 'success' : 'error'} size="sm">
                          {badge.accessLevel}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}



