#!/usr/bin/env python3
# coding: utf-8
"""
Extraction INTELLIGENTE des clés i18n manquantes
Focus: Textes UI réels (boutons, labels, messages, titres)
Cible: 250+ nouvelles clés pour atteindre 880/880
"""

import re
import json
from pathlib import Path
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Dictionnaire de traductions manuel pour les mots-clés courants
MANUAL_DICT = {
    # Navigation
    "Accueil": "Home",
    "Découvrez": "Discover",
    "Explorez": "Explore",
    "Actualités": "News",
    "Événements": "Events",
    "Programme": "Schedule",
    "Exposants": "Exhibitors",
    "Partenaires": "Partners",
    "Lieu du salon": "Venue",
    "Carte du site": "Site Map",
    "Horaires": "Hours",
    "Accès": "Access",
    "Parking": "Parking",
    "Plan": "Map",
    "Contact": "Contact",
    "Nous contacter": "Contact Us",
    "Connexion": "Sign In",
    "Se connecter": "Log In",
    "Inscriptions": "Registration",
    "S'inscrire": "Register",
    "Se déconnecter": "Sign Out",
    "Mon compte": "My Account",
    "Mon profil": "My Profile",
    "Paramètres": "Settings",
    "Aide": "Help",
    "FAQ": "FAQ",
    "Support": "Support",
    "Forum": "Forum",
    "Tableau de bord": "Dashboard",
    "Mes données": "My Data",
    "Mes rendez-vous": "My Appointments",
    "Mes messages": "My Messages",
    "Mes favoris": "My Favorites",
    "Mes paramètres": "My Settings",
    "Mes abonnements": "My Subscriptions",
    
    # Actions
    "Ajouter": "Add",
    "Ajouter un élément": "Add Item",
    "Créer": "Create",
    "Créer un nouveau": "Create New",
    "Nouveau": "New",
    "Éditer": "Edit",
    "Modifier": "Modify",
    "Mettre à jour": "Update",
    "Supprimer": "Delete",
    "Supprimer cet élément": "Delete This Item",
    "Retirer": "Remove",
    "Enregistrer": "Save",
    "Enregistrer les modifications": "Save Changes",
    "Annuler": "Cancel",
    "Réinitialiser": "Reset",
    "Appliquer": "Apply",
    "Appliquer les changements": "Apply Changes",
    "Actualiser": "Refresh",
    "Recharger": "Reload",
    "Retour": "Back",
    "Aller au début": "Go to Top",
    "Fermer": "Close",
    "Ouvrir": "Open",
    "Voir plus": "See More",
    "Voir moins": "See Less",
    "En savoir plus": "Learn More",
    "Continuer": "Continue",
    "Continuer avec": "Continue With",
    "Suivant": "Next",
    "Suivant >": "Next >",
    "Précédent": "Previous",
    "< Précédent": "< Previous",
    "Chercher": "Search",
    "Rechercher": "Search",
    "Filtrer": "Filter",
    "Trier": "Sort",
    "Télécharger": "Download",
    "Télécharger le fichier": "Download File",
    "Exporter": "Export",
    "Importer": "Import",
    "Partager": "Share",
    "Partager sur": "Share on",
    "Copier": "Copy",
    "Copier le lien": "Copy Link",
    "Copié": "Copied",
    "Coller": "Paste",
    "Couper": "Cut",
    "Sélectionner": "Select",
    "Sélectionner tout": "Select All",
    "Désélectionner": "Deselect",
    "Désélectionner tout": "Deselect All",
    "Effacer": "Clear",
    "Effacer tout": "Clear All",
    "Réinitialiser les filtres": "Reset Filters",
    "Archiver": "Archive",
    "Restaurer": "Restore",
    "Dupliquer": "Duplicate",
    "Envoyer": "Send",
    "Envoyer un message": "Send Message",
    "Répondre": "Reply",
    "Valider": "Validate",
    "Vérifier": "Check",
    "Confirmer": "Confirm",
    "Confirmer la suppression": "Confirm Delete",
    "Clôturer": "Close",
    "Rouvrir": "Reopen",
    "Approuver": "Approve",
    "Rejeter": "Reject",
    "Mettre en vedette": "Feature",
    "Retirer de la vedette": "Unfeature",
    "Marquer comme lu": "Mark as Read",
    "Marquer comme non lu": "Mark as Unread",
    "Aimer": "Like",
    "Ne plus aimer": "Unlike",
    "Ajouter aux favoris": "Add to Favorites",
    "Retirer des favoris": "Remove from Favorites",
    "S'abonner": "Subscribe",
    "Se désabonner": "Unsubscribe",
    "Suivre": "Follow",
    "Ne plus suivre": "Unfollow",
    "Vous abonner": "Subscribe to",
    "Voir le détail": "View Details",
    "Voir la fiche": "View Profile",
    "Visiter": "Visit",
    "Visiter le site": "Visit Website",
    "Accéder": "Access",
    "Accéder à": "Access to",
    "Passer la commande": "Place Order",
    "Réserver": "Book",
    "Annuler la réservation": "Cancel Booking",
    "Modifier la réservation": "Modify Booking",
    "Rappel": "Reminder",
    "Définir un rappel": "Set Reminder",
    "Partager le résultat": "Share Result",
    
    # Formulaires
    "Nom": "Name",
    "Prénom": "First Name",
    "Nom de famille": "Last Name",
    "Email": "Email",
    "Adresse email": "Email Address",
    "Téléphone": "Phone",
    "Numéro de téléphone": "Phone Number",
    "Adresse": "Address",
    "Adresse complète": "Full Address",
    "Rue": "Street",
    "Ville": "City",
    "Code postal": "Postal Code",
    "Pays": "Country",
    "État": "State",
    "Région": "Region",
    "Société": "Company",
    "Entreprise": "Business",
    "Fonction": "Position",
    "Titre": "Title",
    "Secteur": "Sector",
    "Secteur d'activité": "Industry",
    "Mot de passe": "Password",
    "Confirmer le mot de passe": "Confirm Password",
    "Ancien mot de passe": "Old Password",
    "Nouveau mot de passe": "New Password",
    "Répéter le mot de passe": "Repeat Password",
    "Message": "Message",
    "Votre message": "Your Message",
    "Commentaire": "Comment",
    "Description": "Description",
    "Détails": "Details",
    "Remarques": "Notes",
    "Observations": "Observations",
    "Date": "Date",
    "Heure": "Time",
    "Début": "Start",
    "Fin": "End",
    "Du": "From",
    "Au": "To",
    "Depuis": "Since",
    "Jusqu'à": "Until",
    "Durée": "Duration",
    "Fréquence": "Frequency",
    "Intervalle": "Interval",
    "Quantité": "Quantity",
    "Montant": "Amount",
    "Prix": "Price",
    "Prix unitaire": "Unit Price",
    "Total": "Total",
    "Sous-total": "Subtotal",
    "Frais": "Fees",
    "Frais de port": "Shipping",
    "Remise": "Discount",
    "Taxe": "Tax",
    "TVA": "VAT",
    "Budget": "Budget",
    "Catégorie": "Category",
    "Type": "Type",
    "Genre": "Genre",
    "Langue": "Language",
    "Autres": "Other",
    "Autre": "Other",
    
    # États & Statuts
    "Actif": "Active",
    "Inactif": "Inactive",
    "Activé": "Enabled",
    "Désactivé": "Disabled",
    "Activé(e)": "Activated",
    "Archivé": "Archived",
    "Supprimé": "Deleted",
    "En attente": "Pending",
    "En cours": "In Progress",
    "Complété": "Completed",
    "Terminé": "Finished",
    "Suspendu": "Suspended",
    "Suspendu(e)": "Suspended",
    "Rejeté": "Rejected",
    "Rejeté(e)": "Rejected",
    "Approuvé": "Approved",
    "Approuvé(e)": "Approved",
    "En attente d'approbation": "Awaiting Approval",
    "En révision": "Under Review",
    "En examen": "Under Examination",
    "Publié": "Published",
    "Publié(e)": "Published",
    "Brouillon": "Draft",
    "Programmé": "Scheduled",
    "Archivé(e)": "Archived",
    "En stock": "In Stock",
    "Rupture de stock": "Out of Stock",
    "Sur commande": "On Order",
    "Expédié": "Shipped",
    "Livré": "Delivered",
    "Retourné": "Returned",
    "Non disponible": "Unavailable",
    "Verrouillé": "Locked",
    "Déverrouillé": "Unlocked",
    
    # Messages d'état
    "Chargement": "Loading",
    "Chargement en cours": "Loading...",
    "Merci d'attendre": "Please wait...",
    "Veuillez patienter": "Please wait",
    "Accédé": "Accessed",
    "Erreur": "Error",
    "Une erreur s'est produite": "An error occurred",
    "Une erreur est survenue": "An error happened",
    "Erreur lors de": "Error during",
    "Impossible de": "Unable to",
    "Essai échoué": "Failed",
    "Succès": "Success",
    "Réussi": "Successful",
    "Opération réussie": "Operation Successful",
    "Attention": "Warning",
    "Avertissement": "Warning",
    "Information": "Information",
    "Info": "Info",
    "Confirmation": "Confirmation",
    "Veuillez confirmer": "Please confirm",
    "Êtes-vous sûr": "Are you sure",
    "Êtes-vous certain": "Are you certain",
    "Veuillez remplir": "Please fill",
    "Champ obligatoire": "Required Field",
    "Champ requis": "Required Field",
    "Obligatoire": "Required",
    "Requis": "Required",
    "Invalide": "Invalid",
    "Format invalide": "Invalid Format",
    "Longueur minimale": "Minimum Length",
    "Longueur maximale": "Maximum Length",
    "Doit être": "Must be",
    "Les mots de passe ne correspondent pas": "Passwords do not match",
    "Email invalide": "Invalid Email",
    "Numéro invalide": "Invalid Number",
    "Date invalide": "Invalid Date",
    "Copié dans le presse-papiers": "Copied to Clipboard",
    "Lien copié": "Link Copied",
    "Non disponible": "Not Available",
    "Indisponible": "Unavailable",
    "Pas de données": "No Data",
    "Aucune donnée": "No Data",
    "Aucun résultat": "No Results",
    "Aucun résultat trouvé": "No Results Found",
    "Pas de résultats": "No Results",
    "Rien à afficher": "Nothing to Display",
    "Accès refusé": "Access Denied",
    "Non autorisé": "Unauthorized",
    "Authentification requise": "Authentication Required",
    "Veuillez vous identifier": "Please Login",
    
    # Pagination
    "Affichage": "Showing",
    "de": "of",
    "éléments": "items",
    "par page": "per page",
    "page": "page",
    "Page": "Page",
    "sur": "of",
    "Première": "First",
    "Dernière": "Last",
    "Premier": "First",
    "Dernier": "Last",
    
    # Entités métier
    "Exposant": "Exhibitor",
    "Partenaire": "Partner",
    "Visiteur": "Visitor",
    "Administrateur": "Administrator",
    "Utilisateur": "User",
    "Rendez-vous": "Appointment",
    "RDV": "Appointment",
    "Réunion": "Meeting",
    "Événement": "Event",
    "Mini-site": "Mini-Site",
    "Produit": "Product",
    "Service": "Service",
    "Offre": "Offer",
    "Solution": "Solution",
    "Document": "Document",
    "Média": "Media",
    "Fichier": "File",
    "Photo": "Photo",
    "Image": "Image",
    "Vidéo": "Video",
    "Son": "Audio",
    "Présentation": "Presentation",
    "Brochure": "Brochure",
    "Catalogue": "Catalog",
    "Rapport": "Report",
    "Statistiques": "Statistics",
    "Analyse": "Analysis",
    "Badge": "Badge",
    "Ticket": "Ticket",
    
    # Courtes réponses
    "Oui": "Yes",
    "Non": "No",
    "Ok": "OK",
    "D'accord": "OK",
    "Valider": "Submit",
    "Soumettre": "Submit",
    "Envoyer": "Send",
    "Merci": "Thank You",
    "Merci!": "Thank You!",
    "Bienvenue": "Welcome",
    "Bienvenue!": "Welcome!",
    "À bientôt": "See You Soon",
    "Au revoir": "Goodbye",
    "À plus": "See You",
}

def extract_ui_strings(content):
    """Extrait les textes UI (vrais textes, pas du code)"""
    strings = set()
    
    patterns = [
        # Textes dans des balises HTML
        (r'>([^<>{}\n]{5,200}[àâäçèéêëîïôöùûüœæ][^<>{}\n]{0,200})</i', 1),
        # placeholder/title/alt
        (r'(?:placeholder|title|alt)=["\']([^"\']*[àâäçèéêëîïôöùûüœæ]+[^"\']*)["\']', 1),
        # Label de formulaire
        (r'<label[^>]*>([^<]*[àâäçèéêëîïôöùûüœæ][^<]*)</label>', 1),
        # Button text
        (r'<(?:button|Button)[^>]*>([^<]*[àâäçèéêëîïôöùûüœæ][^<]*)</(?:button|Button)>', 1),
        # String de message
        (r'["\']([^"\']{10,200}[àâäçèéêëîïôöùûüœæ][^"\']{0,100})["\']', 1),
    ]
    
    for pattern, group_idx in patterns:
        for match in re.finditer(pattern, content, re.DOTALL):
            try:
                text = match.group(group_idx).strip()
                # Filtrer le code et les imports
                if (len(text) > 3 and 
                    len(text) < 250 and
                    not text.startswith('import ') and
                    not text.startswith('const ') and
                    not text.startswith('function ') and
                    not '{' in text and
                    not '=>' in text and
                    '\n' not in text and
                    text.count(';') < 3):
                    strings.add(text)
            except:
                pass
    
    return strings

def sanitize_text(text):
    """Nettoie le texte"""
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)  # Multiple spaces -> one
    text = text.replace('\n', ' ')
    return text[:150]  # Max 150 chars

def make_key(text):
    """Crée une clé i18n"""
    text_clean = text.lower().replace(' ', '_')[:40]
    text_clean = re.sub(r'[^a-z0-9_àâäçèéêëîïôöùûüœæ]', '', text_clean)
    
    # Normaliser accents
    for old, new in [('à', 'a'), ('â', 'a'), ('ä', 'a'), ('ç', 'c'),
                     ('è', 'e'), ('é', 'e'), ('ê', 'e'), ('ë', 'e'),
                     ('î', 'i'), ('ï', 'i'), ('ô', 'o'), ('ö', 'o'),
                     ('ù', 'u'), ('û', 'u'), ('ü', 'u')]:
        text_clean = text_clean.replace(old, new)
    
    return text_clean[:40] or 'item'

def translate_text(text):
    """Traduit en anglais"""
    # Exact matches
    for fr, en in MANUAL_DICT.items():
        if text.strip().lower() == fr.lower():
            return en
    
    # Partial matches
    for fr, en in MANUAL_DICT.items():
        if fr.lower() in text.lower():
            return en
    
    # Default
    return text

def main():
    print("\n[INFO] Extraction intelligente des clés i18n UI")
    print("[INFO] Cible: textes UI réels (boutons, labels, messages)\n")
    
    pages_dir = Path(__file__).parent / 'src' / 'pages'
    
    all_texts = {}
    total_files = 0
    
    for tsx_file in sorted(pages_dir.glob('*.tsx')):
        total_files += 1
        try:
            with open(str(tsx_file), 'r', encoding='utf-8') as f:
                content = f.read()
            
            strings = extract_ui_strings(content)
            
            for s in strings:
                clean_s = sanitize_text(s)
                if clean_s and len(clean_s) > 3:
                    key = make_key(clean_s)
                    full_key = f"pages.ui.{key}"
                    
                    trans = translate_text(clean_s)
                    
                    all_texts[full_key] = {
                        'fr': clean_s,
                        'en': trans
                    }
        except Exception as e:
            print(f"[ERROR] {tsx_file.name}: {e}")
    
    # Sauvegarder
    output_file = Path(__file__).parent / 'I18N_EXTRACTED_UI_KEYS.json'
    with open(str(output_file), 'w', encoding='utf-8') as f:
        json.dump(all_texts, f, indent=2, ensure_ascii=False)
    
    print(f"[OK] {total_files} fichiers analysés")
    print(f"[OK] {len(all_texts)} clés UI extraites")
    print(f"[SAVE] {output_file}\n")
    
    # Aperçu
    print("[PREVIEW] Premiers résultats:\n")
    for i, (k, v) in enumerate(list(all_texts.items())[:15], 1):
        print(f"{i:2d}. {k}")
        print(f"    FR: {v['fr']}")
        print(f"    EN: {v['en']}\n")
    
    return all_texts

if __name__ == '__main__':
    result = main()
