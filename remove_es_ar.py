#!/usr/bin/env python3

# Script pour enlever les sections ES et AR du fichier config.ts

with open('src/i18n/config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver la position de "  es: {"
es_start = content.find('\n  es: {\n')
if es_start == -1:
    print("Section ES not found!")
else:
    # Trouver la fin de la ressource (le closing )} avant i18n)
    # On cherche le dernier "  }" avant "i18n"
    i18n_start = content.find('\ni18n\n  .use(LanguageDetector)')
    
    # On veut garder tout jusqu'à la ligne avant "  es: {"
    new_content = content[:es_start+1]
    
    # Et ajouter la configuration i18n avec juste FR et EN
    new_content += '};\n\ni18n\n  .use(LanguageDetector)\n  .use(initReactI18next)\n  .init({\n    resources,\n    fallbackLng: \'fr\',\n    supportedLngs: [\'fr\', \'en\'],'
    
    # Continuer avec le reste de la config (à partir de detection)
    detection_start = content.find('\n    detection: {')
    if detection_start != -1:
        new_content += content[detection_start:]
    
    with open('src/i18n/config.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ ES et AR sections removed!")
    print("✅ supportedLngs updated to ['fr', 'en']")
