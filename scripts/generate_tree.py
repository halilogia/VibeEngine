import os

def generate_project_tree(root_dir, output_file, ignore_dirs=None):
    if ignore_dirs is None:
        ignore_dirs = {'.git', 'node_modules', 'dist', '.gemini', 'package-lock.json', '.cache'}
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# 🌳 VibeEngine SRC Layer Map\n\n")
        f.write("A deep dive into the source code architecture.\n\n")
        f.write("```bash\n")
        
        # Only walk from root_dir (which should be 'src')
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]
            
            level = root.replace(root_dir, '').count(os.sep)
            # Adjust indent to start cleanly from src/
            indent = '│   ' * (level) + '├── ' if level > 0 else ''
            
            if level == 0:
                f.write(f"src/\n")
            else:
                f.write(f"{indent}{os.path.basename(root)}/\n")
            
            sub_indent = '│   ' * (level + 1) + '├── '
            for file in sorted(files):
                if file.startswith('.') or file in ignore_dirs:
                    continue
                f.write(f"{sub_indent}{file}\n")
        
        f.write("```\n")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..'))
    src_dir = os.path.join(project_root, 'src')
    output_path = os.path.join(project_root, 'brain', 'project_tree.md')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print(f"🔍 Scanning SRC directory: {src_dir}")
    generate_project_tree(src_dir, output_path)
    print(f"✅ SRC tree saved to: brain/project_tree.md")
