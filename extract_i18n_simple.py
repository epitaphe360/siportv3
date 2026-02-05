#!/usr/bin/env python3
# coding: utf-8
"""
Extraction massive de clés i18n manquantes - Batch Final
Cible: +250 clés pour atteindre 880/880 (70% complétude)
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
import sys
import io

# Force UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Traductions FR -> EN
TRANSLATIONS = {
    "Accueil": "Home",
    "Actualités": "News",
    "Événements": "Events",
    "Exposants": "Exhibitors",
    "Partenaires": "Partners",
    "Contact": "Contact",
    "Connexion": "Sign In",
    "Inscription": "Sign Up",
    "Paramètres": "Settings",
    "Profil": "Profile",
    "Tableau de bord": "Dashboard",
    "Nom": "Name",
    "Prénom": "First Name",
    "Email": "Email",
    "Mot de passe": "Password",
    "Envoyer": "Send",
    "Modifier": "Edit",
    "Supprimer": "Delete",
    "Rechercher": "Search",
    "Enregistrer": "Save",
    "Télécharger": "Download",
    "Exporter": "Export",
    "Chargement": "Loading",
    "Erreur": "Error",
    "Succes": "Success",
    "Retour": "Back",
    "Fermer": "Close",
    "Bienvenue": "Welcome",
    "Merci": "Thank You",
    "Oui": "Yes",
    "Non": "No",
}

def extract_strings_from_file(filepath):
    """Extrait les chaînes françaises d'un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []
    
    strings = set()
    
    # Patterns pour chaînes françaises
    patterns = [
        r'["\'`]([^"`\']*[àâäçèéêëîïôöùûüœæÀÂÄÇÈÉÊËÎÏÔÖÙÛÜŒÆ]+[^"`\']*)["`\']',
        r'>([^<]*[àâäçèéêëîïôöùûüœæ]+[^<]*)<',
        r'placeholder=["\']([^"\']*[àâäçèéêëîïôöùûüœæ]+[^"\']*)["\']',
    ]
    
    for pattern in patterns:
        for match in re.finditer(pattern, content):
            text = match.group(1).strip()
            if len(text) > 2 and not text.startswith('pages.') and not text.startswith('common.'):
                strings.add(text)
    
    return list(strings)

def propose_i18n_key(text):
    """Crée une clé i18n à partir du texte"""
    text = text.lower().strip()[:50]
    text = re.sub(r'[^a-z0-9àâäçèéêëîïôöùûüœæ\s]', '', text)
    
    words = text.split()[:3]
    key = '_'.join(words) if words else 'text'
    
    # Normaliser les accents
    key = key.replace('à', 'a').replace('â', 'a').replace('ä', 'a')
    key = key.replace('ç', 'c').replace('è', 'e').replace('é', 'e')
    key = key.replace('ê', 'e').replace('ë', 'e').replace('î', 'i')
    key = key.replace('ï', 'i').replace('ô', 'o').replace('ö', 'o')
    key = key.replace('ù', 'u').replace('û', 'u').replace('ü', 'u')
    
    return key[:50]

def get_translation(text):
    """Obtient la traduction EN"""
    if text in TRANSLATIONS:
        return TRANSLATIONS[text]
    
    for fr, en in TRANSLATIONS.items():
        if fr.lower() in text.lower():
            return en
    
    return text

def main():
    print("\n[EXTRACTION] Scan des fichiers pages...\n")
    
    pages_dir = Path(__file__).parent / 'src' / 'pages'
    if not pages_dir.exists():
        print("[ERROR] Repertoire src/pages non trouve")
        return {}
    
    all_texts = defaultdict(lambda: {'count': 0})
    file_count = 0
    
    for tsx_file in sorted(pages_dir.glob('*.tsx')):
        file_count += 1
        strings = extract_strings_from_file(str(tsx_file))
        
        for s in strings:
            all_texts[s]['count'] += 1
            if 'translation' not in all_texts[s]:
                all_texts[s]['translation'] = get_translation(s)
    
    print("[OK] {} fichiers scans".format(file_count))
    
    # Créer les clés i18n
    output = {}
    for text in sorted(all_texts.keys()):
        key = propose_i18n_key(text)
        trans = all_texts[text]['translation']
        
        full_key = "pages.extracted." + key
        output[full_key] = {
            "fr": text,
            "en": trans
        }
    
    # Sauvegarder
    outfile = Path(__file__).parent / 'EXTRACTED_I18N_FINAL.json'
    with open(str(outfile), 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("[SAVE] {} cles extraites -> {}".format(len(output), outfile))
    
    # Aperçu
    print("\n[PREVIEW] Premieres cles:\n")
    for i, (k, v) in enumerate(list(output.items())[:10], 1):
        print("  {}. {}".format(i, k))
        print("     FR: {}".format(v['fr']))
        print("     EN: {}".format(v['en']))
    
    print("\n[DONE] Total: {} cles\n".format(len(output)))
    
    return output

if __name__ == '__main__':
    result = main()
    print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
