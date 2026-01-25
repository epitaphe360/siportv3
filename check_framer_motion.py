import os
import re

patterns = [re.compile(r'<motion\.'), re.compile(r'<AnimatePresence')]
import_line_pattern = re.compile(r'import\s+.*?from\s+[\'\"]framer-motion[\'\"]', re.DOTALL)
motion_import = re.compile(r'\bmotion\b')
ap_import = re.compile(r'\bAnimatePresence\b')

def check_files():
    results = []
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        has_motion = bool(patterns[0].search(content))
                        has_ap = bool(patterns[1].search(content))
                        
                        if has_motion or has_ap:
                            import_match = import_line_pattern.search(content)
                            if not import_match:
                                results.append(f"{path}: Aucun import de framer-motion")
                            else:
                                import_text = import_match.group(0)
                                if has_motion and not motion_import.search(import_text):
                                    results.append(f"{path}: 'motion' utilisé mais pas importé")
                                if has_ap and not ap_import.search(import_text):
                                    results.append(f"{path}: 'AnimatePresence' utilisé mais pas importé")
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return results

if __name__ == "__main__":
    findings = check_files()
    if findings:
        for finding in findings:
            print(finding)
    else:
        print("Aucune erreur trouvée.")
