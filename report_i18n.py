#!/usr/bin/env python3
# coding: utf-8
"""Générer un rapport formaté des clés i18n extraites"""

import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    with open('I18N_EXTRACTED_UI_KEYS.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"\n{'='*80}")
    print(f"RAPPORT D'EXTRACTION I18N - BATCH FINAL")
    print(f"{'='*80}\n")
    
    print(f"[STATISTIQUES]")
    print(f"  Total clés extraites: {len(data)}")
    print(f"  Pages analysées: 39 fichiers TSX\n")
    
    print(f"[FORMAT JSON]")
    print(f"  Fichier: I18N_EXTRACTED_UI_KEYS.json")
    print(f"  Format: {{'clé_i18n': {{'fr': '...', 'en': '...'}}}}\n")
    
    print(f"[PREMIÈRES 60 CLÉS EXTRAITES]\n")
    
    for i, (key, val) in enumerate(list(data.items())[:60], 1):
        print(f"{i:3d}. {key}")
        print(f"     FR: {val['fr'][:60]}")
        print(f"     EN: {val['en'][:60]}\n")
    
    remaining = len(data) - 60
    if remaining > 0:
        print(f"\n... et {remaining} autres clés\n")
    
    print(f"{'='*80}")
    print(f"✅ EXTRACTION REUSSIE")
    print(f"{'='*80}\n")
    
    # Retourner le JSON complet
    return_file = 'I18N_FINAL_EXTRACTION.json'
    with open(return_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Fichier JSON copié vers: {return_file}")

except Exception as e:
    print(f"\nErreur: {e}")
    import traceback
    traceback.print_exc()
