import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ProductService } from '../services/products/productService';
import { ROUTES } from '../lib/routes';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download, Mail, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { exhibitorId, productId } = useParams<{ exhibitorId: string; productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!productId) { setError('Produit introuvable'); setLoading(false); return; }
      try {
        setLoading(true);
        const p = await ProductService.getProductById(productId);
        setProduct(p);
      } catch (e) {
        console.error(e);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const bookRdv = () => {
    if (!exhibitorId) return;
    const target = `${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`;
    if (!isAuthenticated) navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(target)}`);
    else navigate(target);
  };

  const contactExhibitor = () => {
    // Optionally this page could receive exhibitor email via location state; fallback toast
    toast.info("Contactez l'exposant depuis sa page détaillée");
    if (exhibitorId) navigate(`/exhibitors/${exhibitorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Chargement du produit…</div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-red-600 mb-4">{error || 'Produit non trouvé'}</p>
        {exhibitorId && (
          <Link to={`/exhibitors/${exhibitorId}`} className="text-blue-600 underline">Retour à l'exposant</Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => exhibitorId ? navigate(`/exhibitors/${exhibitorId}`) : navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">Aucune image</div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {product.images.slice(1).map((img, idx) => (
                    <img key={idx} src={img} alt={`${product.name}-${idx}`} className="w-20 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </Card>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" size="sm">{product.category}</Badge>
                {product.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>
              <p className="text-gray-700 mb-6">{product.description}</p>

              {product.specifications && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-2">Spécifications</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{product.specifications}</p>
                </Card>
              )}

              {product.technicalSpecs && product.technicalSpecs.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-2">Caractéristiques techniques</h3>
                  <ul className="list-disc pl-6 text-sm text-gray-700">
                    {product.technicalSpecs.map((s, i) => (
                      <li key={i}>{s.name}: {s.value}{s.unit ? ` ${s.unit}` : ''}</li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="default" onClick={bookRdv}>
                  <Calendar className="h-4 w-4 mr-2" /> Prendre RDV
                </Button>
                <Button variant="outline" onClick={contactExhibitor}>
                  <Mail className="h-4 w-4 mr-2" /> Contacter
                </Button>
                {product.brochure && (
                  <a href={product.brochure} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Brochure</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
