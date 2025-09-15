import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Building2,
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

interface DemoProgram {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  speaker: string;
  company: string;
  type: string;
  capacity: number;
  location: string;
  tags: string[];
}

export default function CreatePavilionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // État du formulaire pavillon
  const [pavilionData, setPavilionData] = useState({
    name: '',
    theme: '',
    description: '',
    objectives: [''],
    features: [''],
    targetAudience: [''],
    status: 'active'
  });

  // État des programmes de démonstration
  const [demoPrograms, setDemoPrograms] = useState<DemoProgram[]>([]);

  const themes = [
    { value: 'digitalization', label: 'Digitalisation' },
    { value: 'sustainability', label: 'Développement Durable' },
    { value: 'security', label: 'Sécurité & Cybersécurité' },
    { value: 'innovation', label: 'Innovation & Start-ups' }
  ];

  const demoTypes = [
    { value: 'presentation', label: 'Présentation' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'demo', label: 'Démonstration' },
    { value: 'roundtable', label: 'Table ronde' }
  ];

  const handlePavilionChange = (field: string, value: any) => {
    setPavilionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'objectives' | 'features' | 'targetAudience', index: number, value: string) => {
    setPavilionData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'objectives' | 'features' | 'targetAudience') => {
    setPavilionData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'objectives' | 'features' | 'targetAudience', index: number) => {
    setPavilionData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const addDemoProgram = () => {
    const newProgram: DemoProgram = {
      id: `demo_${Date.now()}`,
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '',
      speaker: '',
      company: '',
      type: 'presentation',
      capacity: 50,
      location: '',
      tags: []
    };
    setDemoPrograms(prev => [...prev, newProgram]);
  };

  const updateDemoProgram = (index: number, field: string, value: any) => {
    setDemoPrograms(prev => prev.map((program, i) =>
      i === index ? { ...program, [field]: value } : program
    ));
  };

  const removeDemoProgram = (index: number) => {
    setDemoPrograms(prev => prev.filter((_, i) => i !== index));
  };

  const addDemoTag = (programIndex: number, tag: string) => {
    if (tag.trim()) {
      setDemoPrograms(prev => prev.map((program, i) =>
        i === programIndex
          ? { ...program, tags: [...program.tags, tag.trim()] }
          : program
      ));
    }
  };

  const removeDemoTag = (programIndex: number, tagIndex: number) => {
    setDemoPrograms(prev => prev.map((program, i) =>
      i === programIndex
        ? { ...program, tags: program.tags.filter((_, j) => j !== tagIndex) }
        : program
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ici vous pouvez implémenter la logique de sauvegarde
      console.log('Pavillon data:', pavilionData);
      console.log('Demo programs:', demoPrograms);

      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirection vers la liste des pavillons
  navigate(ROUTES.ADMIN_PAVILIONS);
    } catch (error) {
      console.error('Erreur lors de la création du pavillon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to={ROUTES.ADMIN_PAVILIONS}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Créer un Pavillon Thématique</h1>
              <p className="text-gray-600 mt-2">
                Configurez un nouveau pavillon SIPORTS 2026 avec ses programmes de démonstration
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations générales du pavillon */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Informations Générales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Pavillon *
                  </label>
                  <input
                    type="text"
                    required
                    value={pavilionData.name}
                    onChange={(e) => handlePavilionChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Pavillon Digitalisation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème *
                  </label>
                  <select
                    required
                    value={pavilionData.theme}
                    onChange={(e) => handlePavilionChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un thème</option>
                    {themes.map(theme => (
                      <option key={theme.value} value={theme.value}>{theme.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={pavilionData.description}
                  onChange={(e) => handlePavilionChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez le pavillon et ses objectifs principaux..."
                />
              </div>
            </div>
          </Card>

          {/* Objectifs */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs du Pavillon</h3>
              <div className="space-y-3">
                {pavilionData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Présenter les dernières innovations technologiques"
                    />
                    {pavilionData.objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('objectives', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('objectives')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un objectif
                </Button>
              </div>
            </div>
          </Card>

          {/* Fonctionnalités */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités Clés</h3>
              <div className="space-y-3">
                {pavilionData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Intelligence Artificielle & Machine Learning"
                    />
                    {pavilionData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('features', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('features')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une fonctionnalité
                </Button>
              </div>
            </div>
          </Card>

          {/* Public cible */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Cible</h3>
              <div className="space-y-3">
                {pavilionData.targetAudience.map((audience, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Directeurs IT"
                    />
                    {pavilionData.targetAudience.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('targetAudience', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('targetAudience')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un public cible
                </Button>
              </div>
            </div>
          </Card>

          {/* Programmes de démonstration */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                  Programmes de Démonstration ({demoPrograms.length})
                </h2>
                <Button
                  type="button"
                  variant="default"
                  onClick={addDemoProgram}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Programme
                </Button>
              </div>

              <div className="space-y-6">
                {demoPrograms.map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Programme #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDemoProgram(index)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre *
                        </label>
                        <input
                          type="text"
                          required
                          value={program.title}
                          onChange={(e) => updateDemoProgram(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type *
                        </label>
                        <select
                          required
                          value={program.type}
                          onChange={(e) => updateDemoProgram(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {demoTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={program.description}
                        onChange={(e) => updateDemoProgram(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={program.date}
                          onChange={(e) => updateDemoProgram(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heure *
                        </label>
                        <input
                          type="time"
                          required
                          value={program.time}
                          onChange={(e) => updateDemoProgram(index, 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durée *
                        </label>
                        <input
                          type="text"
                          required
                          value={program.duration}
                          onChange={(e) => updateDemoProgram(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 1h30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Intervenant *
                        </label>
                        <input
                          type="text"
                          required
                          value={program.speaker}
                          onChange={(e) => updateDemoProgram(index, 'speaker', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Entreprise *
                        </label>
                        <input
                          type="text"
                          required
                          value={program.company}
                          onChange={(e) => updateDemoProgram(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lieu *
                        </label>
                        <input
                          type="text"
                          required
                          value={program.location}
                          onChange={(e) => updateDemoProgram(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacité *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={program.capacity}
                          onChange={(e) => updateDemoProgram(index, 'capacity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {program.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="default" className="flex items-center space-x-1">
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeDemoTag(index, tagIndex)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Ajouter un tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addDemoTag(index, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addDemoTag(index, input.value);
                            input.value = '';
                          }}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link to={ROUTES.ADMIN_PAVILIONS}>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer le Pavillon
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
