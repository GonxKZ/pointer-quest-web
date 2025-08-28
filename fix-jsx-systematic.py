#!/usr/bin/env python3

import os
import re
import glob
from typing import List, Tuple

def fix_jsx_errors(file_path: str) -> int:
    """Fix JSX errors in a specific file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    fixes_applied = 0
    
    # Pattern 1: </InteractiveSection> que debería ser </div>
    # Buscar casos donde hay un div abierto pero se cierra con InteractiveSection
    pattern1 = r'(<div[^>]*>.*?)\s*</InteractiveSection>'
    matches1 = re.findall(pattern1, content, re.DOTALL)
    if matches1:
        content = re.sub(pattern1, r'\1</div>', content, flags=re.DOTALL)
        fixes_applied += len(matches1)
        print(f"  - Fixed {len(matches1)} mismatched </InteractiveSection> tags")
    
    # Pattern 2: Divs sin cerrar al final de bloques JSX
    # Buscar patrones donde hay un <div> pero falta el cierre antes de un }
    pattern2 = r'(<div[^>]*>[^<]*{[^}]*}[^<]*)\s*(?=\s*</[A-Z])'
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        fixed_line = line
        
        # Si la línea tiene un div sin cerrar y la siguiente tiene un </Component>
        if '<div' in line and not '</div>' in line and i + 1 < len(lines):
            next_line = lines[i + 1]
            if re.match(r'^\s*</', next_line) and not 'div>' in next_line:
                # Agregar cierre de div
                indent = re.match(r'^(\s*)', next_line).group(1) if re.match(r'^(\s*)', next_line) else '  '
                fixed_lines.append(line + '</div>')
                fixes_applied += 1
                print(f"  - Added missing </div> at line {i + 1}")
                continue
        
        fixed_lines.append(fixed_line)
    
    if fixes_applied > 0:
        content = '\n'.join(fixed_lines)
    
    # Guardar si hubo cambios
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Applied {fixes_applied} fixes")
        return fixes_applied
    else:
        print(f"  ⚪ No fixes needed")
        return 0

def main():
    """Fix JSX errors in all lesson files"""
    lesson_files = glob.glob('src/lessons/Lesson*.tsx')
    print(f"Found {len(lesson_files)} lesson files")
    
    total_fixes = 0
    
    for file_path in lesson_files:
        print(f"\nProcessing {file_path}...")
        fixes = fix_jsx_errors(file_path)
        total_fixes += fixes
    
    print(f"\n🎉 Total fixes applied: {total_fixes}")

if __name__ == "__main__":
    main()