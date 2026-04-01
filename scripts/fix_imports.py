import os
import re

def update_imports(file_path, rel_path):
    # Rule 0: DONT fix index.ts files for self-referential aliases
    is_index = file_path.endswith('index.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    norm_path = rel_path.replace('\\', '/')
    is_engine = norm_path.startswith('engine/')
    
    # Rule 1: Engine Path Synchronization
    if is_engine:
        # Only fix if NOT an index.ts to avoid circularity
        if not is_index:
            content = re.sub(r"from\s+['\"](\.\.?\/)+(core|systems|components|utils|engine)(/.*)?['\"]", "from '@engine'", content)
            content = content.replace("@editor/core", "@engine")
    else:
        # Non-engine files
        content = re.sub(r"from\s+['\"](\.\.?\/)+engine(/\w+)?['\"]", "from '@engine'", content)
    
    # Rule 2: Infrastructure/Store
    if not is_index:
        content = re.sub(r"from\s+['\"](\.\.?\/)+(stores?|store)(/.*)?['\"]", "from '@infrastructure/store'", content)
        content = re.sub(r"from\s+['\"]@editor\/(stores?|store)(/.*)?['\"]", "from '@infrastructure/store'", content)
    
    # Rule 3: Editor Internal 
    if 'presentation/features/editor' in norm_path and not is_index:
        editor_subs = 'bridge|serialization|viewport|hooks|assets|core|commands|shortcuts|storage|styles'
        content = re.sub(rf"from\s+['\"](\.\.?\/)+({editor_subs})(/.*)?['\"]", lambda m: f"from '@editor/{m.group(2)}'", content)

    # Rule 4: UI/Editor 
    if not is_index:
        content = re.sub(r"from\s+['\"](\.\.?\/)+(ui\/editor|presentation\/ui\/editor)(/.*)?['\"]", "from '@ui/editor'", content)
        content = content.replace('@editor/panels', '@ui/editor')
    
    # Common UI Atoms and Themes (Global) - Always Safe
    content = re.sub(r"from\s+['\"].*\/common\/VibeIcons['\"]", "from '@ui/common/VibeIcons'", content)
    content = re.sub(r"from\s+['\"].*\/atomic\/atoms\/VibeButton['\"]", "from '@ui/atomic/atoms/VibeButton'", content)
    content = re.sub(r"from\s+['\"].*\/atomic\/atoms\/VibeInput['\"]", "from '@ui/atomic/atoms/VibeInput'", content)
    content = re.sub(r"from\s+['\"].*\/themes\/VibeStyles['\"]", "from '@themes/VibeStyles'", content)
    
    if is_engine:
        content = content.replace("@editor/core", "@engine")
        # Fix any nested infrastructure mistake
        content = content.replace("@infrastructure/@infrastructure", "@infrastructure")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def walk_and_fix(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                update_imports(full_path, rel_path)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    src_dir = os.path.join(project_root, 'src')
    print(f"🛠️ FINAL Import Guard Synchronization in: {src_dir}")
    walk_and_fix(src_dir)
    print("✅ All imports locked and loaded.")
