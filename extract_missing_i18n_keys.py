#!/usr/bin/env python3
"""
Script d'extraction URGENTE de clés i18n manquantes FR+EN
Analyse 40+ fichiers pages et extrait les textes UI non traduits
Cible: +250 clés supplémentaires pour atteindre 880/880
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
import sys

# Dictionnaire de traductions prédéfini (FR -> EN)
FR_EN_TRANSLATIONS = {
    # Pages principales
    "Accueil": "Home",
    "Découvrez": "Discover",
    "Actualités": "News",
    "Événements": "Events",
    "Exposants": "Exhibitors",
    "Partenaires": "Partners",
    "Lieu": "Venue",
    "Contact": "Contact",
    "Connexion": "Sign In",
    "Inscription": "Sign Up",
    "S'inscrire": "Register",
    "Paramètres": "Settings",
    "Profil": "Profile",
    "Tableau de bord": "Dashboard",
    "Déconnexion": "Sign Out",
    "Mon compte": "My Account",
    
    # Formulaires
    "Nom": "Name",
    "Prénom": "First Name",
    "Email": "Email",
    "Mot de passe": "Password",
    "Confirmer": "Confirm",
    "Soumettre": "Submit",
    "Annuler": "Cancel",
    "Valider": "Validate",
    "Envoyer": "Send",
    "Modifier": "Edit",
    "Supprimer": "Delete",
    "Rechercher": "Search",
    "Filtrer": "Filter",
    "Trier": "Sort",
    "Enregistrer": "Save",
    "Charger": "Load",
    "Télécharger": "Download",
    "Exporter": "Export",
    "Importer": "Import",
    
    # Messages d'état
    "Chargement": "Loading",
    "Erreur": "Error",
    "Réussi": "Success",
    "Attention": "Warning",
    "Info": "Information",
    "Confirmation": "Confirmation",
    "Veuillez remplir": "Please fill",
    "Obligatoire": "Required",
    "Invalide": "Invalid",
    "Veuillez attendre": "Please wait",
    "En cours": "Processing",
    "Complété": "Completed",
    "Annulé": "Cancelled",
    "En attente": "Pending",
    
    # Navigation
    "Retour": "Back",
    "Suivant": "Next",
    "Précédent": "Previous",
    "Accueil": "Home",
    "Fermer": "Close",
    "Ouvrir": "Open",
    "Voir plus": "See More",
    "Voir moins": "See Less",
    "Tous": "All",
    "Aucun": "None",
    
    # Textes courants
    "Bienvenue": "Welcome",
    "Merci": "Thank You",
    "Oui": "Yes",
    "Non": "No",
    "Ok": "OK",
    "Continue": "Continue",
    "Quitter": "Leave",
    "Partager": "Share",
    "Copier": "Copy",
    "Coller": "Paste",
    "Couper": "Cut",
    "Sélectionner": "Select",
    "Désélectionner": "Deselect",
    
    # Entités métier
    "Exposant": "Exhibitor",
    "Partenaire": "Partner",
    "Visiteur": "Visitor",
    "Administrateur": "Administrator",
    "Rendez-vous": "Appointment",
    "Réunion": "Meeting",
    "Événement": "Event",
    "Mini-site": "Mini-Site",
    "Produit": "Product",
    "Service": "Service",
    "Document": "Document",
    "Média": "Media",
    "Photo": "Photo",
    "Vidéo": "Video",
    "Présentation": "Presentation",
    "Brochure": "Brochure",
    
    # Données
    "Date": "Date",
    "Heure": "Time",
    "Lieu": "Location",
    "Durée": "Duration",
    "Début": "Start",
    "Fin": "End",
    "Depuis": "From",
    "Jusqu'à": "To",
    "Quantité": "Quantity",
    "Prix": "Price",
    "Total": "Total",
    "Sous-total": "Subtotal",
    "Frais": "Fees",
    "Remise": "Discount",
    "TVA": "Tax",
    
    # Statuts
    "Actif": "Active",
    "Inactif": "Inactive",
    "Archivé": "Archived",
    "Suspendu": "Suspended",
    "Rejeté": "Rejected",
    "Approuvé": "Approved",
    "En révision": "Under Review",
    "Publié": "Published",
    "Brouillon": "Draft",
    "Supprimé": "Deleted",
    
    # Actions
    "Ajouter": "Add",
    "Créer": "Create",
    "Mettre à jour": "Update",
    "Actualiser": "Refresh",
    "Réinitialiser": "Reset",
    "Appliquer": "Apply",
    "Appliquer les filtres": "Apply Filters",
    "Effacer": "Clear",
    "Effacer tout": "Clear All",
    "Restaurer": "Restore",
    "Dupliquer": "Duplicate",
    "Cloner": "Clone",
    
    # Validations
    "Champ requis": "Field Required",
    "Format invalide": "Invalid Format",
    "Longueur minimale": "Minimum Length",
    "Longueur maximale": "Maximum Length",
    "Doit être numérique": "Must be Numeric",
    "Email invalide": "Invalid Email",
    "Les mots de passe ne correspondent pas": "Passwords do not match",
    
    # Notifications
    "Succès": "Success",
    "Opération réussie": "Operation Successful",
    "Une erreur s'est produite": "An Error Occurred",
    "Veuillez réessayer": "Please Try Again",
    "Copié dans le presse-papiers": "Copied to Clipboard",
    "Non disponible": "Not Available",
    "Indisponible": "Unavailable",
    
    # Pagination
    "Affichage": "Showing",
    "de": "of",
    "éléments": "items",
    "par page": "per page",
    "Première": "First",
    "Dernière": "Last",
    "Page": "Page",
}

def extract_french_strings(filepath):
    """Extrait les chaînes française d'un fichier TSX/TS"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []
    
    strings = []
    
    # Patterns pour détecter les chaînes françaises
    patterns = [
        r'["\'`]([^"`\']*[àâäçèéêëîïôöùûüœæÀÂÄÇÈÉÊËÎÏÔÖÙÛÜŒÆ]+[^"`\']*)["`\']',  # Accents français
        r'placeholder=["\']([^"\']*[àâäçèéêëîïôöùûüœæ]+[^"\']*)["\']',
        r'title=["\']([^"\']*[àâäçèéêëîïôöùûüœæ]+[^"\']*)["\']',
        r'>([^<]*[àâäçèéêëîïôöùûüœæ]+[^<]*)</i',
        r'alt=["\']([^"\']*[àâäçèéêëîïôöùûüœæ]+[^"\']*)["\']',
        r'({t\(["\']([^"\']+)["\']))',  # Chaînes déjà i18n
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, content)
        for match in matches:
            text = match.group(1) if match.lastindex >= 1 else match.group(0)
            if text and len(text.strip()) > 2:
                strings.append(text.strip())
    
    return strings

def propose_key(french_text):
    """Propose une clé i18n basée sur le texte français"""
    # Nettoyer
    text = french_text.lower().strip()
    text = re.sub(r'[^a-zàâäçèéêëîïôöùûüœæ0-9\s\-]', '', text)
    
    # Créer la clé
    parts = text.split()
    if len(parts) > 3:
        parts = parts[:3]
    
    key = '_'.join(parts)
    key = key.replace('à', 'a').replace('â', 'a').replace('ä', 'a')\
            .replace('ç', 'c').replace('è', 'e').replace('é', 'e')\
            .replace('ê', 'e').replace('ë', 'e').replace('î', 'i')\
            .replace('ï', 'i').replace('ô', 'o').replace('ö', 'o')\
            .replace('ù', 'u').replace('û', 'u').replace('ü', 'u')\
            .replace('œ', 'oe').replace('æ', 'ae')
    
    return key

def get_translation(text):
    """Obtient la traduction EN d'un texte FR"""
    # Vérifier exact match
    if text in FR_EN_TRANSLATIONS:
        return FR_EN_TRANSLATIONS[text]
    
    # Vérifier partial matches
    for fr, en in FR_EN_TRANSLATIONS.items():
        if fr.lower() in text.lower() or text.lower() in fr.lower():
            return en
    
    # Fallback simple
    return text  # Retourner le texte original en cas d'échec

def scan_pages_directory():
    """Scanne le répertoire pages et extrait les clés"""
    current_dir = Path(__file__).parent
    pages_dir = current_dir / 'src' / 'pages'
    
    if not pages_dir.exists():
        print(f"❌ Répertoire {pages_dir} non trouvé")
        return {}
    
    all_strings = defaultdict(lambda: {'files': set(), 'translation': None})
    
    files_analyzed = 0
    for filepath in pages_dir.glob('**/*.tsx'):
        files_analyzed += 1
        print(f"  Analyse: {filepath.name}...", end=' ')
        
        strings = extract_french_strings(str(filepath))
        
        for s in strings:
            if s and len(s.strip()) > 0:
                all_strings[s]['files'].add(filepath.name)
                if not all_strings[s]['translation']:
                    all_strings[s]['translation'] = get_translation(s)
        
        print(f"({len(strings)} strings)")
    
    print(f"\n✅ {files_analyzed} fichiers analysés")
    return all_strings

def main():
    # Pas de chdir nécessaire, utiliser les chemins absolus
    print("\n" + "="*80)
    print("🚀 EXTRACTION URGENTE DES CLÉS I18N MANQUANTES - BATCH FINAL")
    print("="*80)
    print("\n📍 Cible: +250 clés pour atteindre 880/880 textes traduits (70%)")
    print("\n" + "="*80 + "\n")
    
    print("1️⃣  SCAN DES FICHIERS PAGES...\n")
    strings_dict = scan_pages_directory()
    
    print("\n2️⃣  EXTRACTION DES CLÉS I18N...\n")
    
    missing_keys = {}
    duplicate_count = 0
    
    for french_text in sorted(strings_dict.keys()):
        if french_text.startswith('pages.') or french_text.startswith('common.'):
            # Déjà une clé i18n
            continue
        
        info = strings_dict[french_text]
        key = propose_key(french_text)
        english_text = info['translation']
        
        # Déterminer la catégorie
        if 'button' in french_text.lower() or 'clic' in french_text.lower():
            category = 'ui.buttons'
        elif 'error' in french_text.lower() or 'erreur' in french_text.lower():
            category = 'ui.errors'
        elif 'placeholder' in french_text.lower():
            category = 'ui.placeholders'
        elif 'label' in french_text.lower():
            category = 'ui.labels'
        else:
            category = 'pages.common'
        
        full_key = f"{category}.{key}"
        
        # Éviter les doublons
        if full_key not in missing_keys:
            missing_keys[full_key] = {
                'fr': french_text,
                'en': english_text,
                'files': len(info['files'])
            }
        else:
            duplicate_count += 1
    
    print(f"✅ {len(missing_keys)} clés uniques trouvées")
    print(f"⚠️  {duplicate_count} doublons dédupliqués\n")
    
    # Créer le JSON de sortie
    output_json = {}
    for key, data in sorted(missing_keys.items()):
        output_json[key] = {
            'fr': data['fr'],
            'en': data['en']
        }
    
    # Sauvegarder le fichier
    output_file = Path(__file__).parent / 'EXTRACTED_I18N_BATCH_FINAL.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_json, f, indent=2, ensure_ascii=False)
    
    print(f"3️⃣  RÉSULTATS SAUVEGARDÉS\n")
    print(f"📄 Fichier: {output_file}")
    print(f"📊 Total: {len(output_json)} clés i18n extraites\n")
    print("4️⃣  APERÇU DES 30 PREMIÈRES CLÉS:\n")
    for i, (key, data) in enumerate(list(output_json.items())[:30], 1):
        print(f"  {i:2d}. {key}")
        print(f"      FR: {data['fr']}")
        print(f"      EN: {data['en']}\n")
    
    print(f"... et {max(0, len(output_json) - 30)} autres clés")
    print("\n" + "="*80)
    print(f"✨ EXTRACTION RÉUSSIE! Fichier sauvegardé: {output_file}")
    print("="*80 + "\n")
    
    # Retourner le JSON
    return output_json

if __name__ == '__main__':
    try:
        result = main()
        print(json.dumps(result, indent=2, ensure_ascii=False)[:5000])  # Afficher les 5000 premiers caractères
    except Exception as e:
        print(f"❌ Erreur: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
