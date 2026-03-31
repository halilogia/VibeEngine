import os
import re
import json

# VibeEngine Reliability Scoring (VERS) v2.0 - Line-based Coverage
# Criteria:
# - Statement Coverage (40%): (pct / 100) * 40 from Vitest JSON Summary
# - Type Safety (30%): (1 - 'any' count / total lines) * 30
# - Documentation (20%): JSDoc block count
# - Structural Health (10%): Average lines per file (under 300 is ideal)

def audit_project(root_dir):
    src_dir = os.path.join(root_dir, 'src')
    report = {
        'total_files': 0,
        'test_files': 0,
        'any_count': 0,
        'total_lines': 0,
        'jsdoc_count': 0,
        'oversized_files': []
    }

    # 1. Static Analysis (Types & Docs)
    for root, dirs, files in os.walk(src_dir):
        if 'node_modules' in root or 'dist' in root or '__tests__' in root:
            continue
            
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                report['total_files'] += 1
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    report['total_lines'] += len(lines)
                    
                    if len(lines) > 300:
                        report['oversized_files'].append(file)
                    
                    content = "".join(lines)
                    report['any_count'] += len(re.findall(r':\s*any|as\s*any', content))
                    report['jsdoc_count'] += len(re.findall(r'/\*\*[\s\S]*?\*/', content))

    # 2. Coverage Analysis (Line-based)
    coverage_pct = 0
    coverage_found = False
    try:
        summary_path = os.path.join(root_dir, 'coverage', 'coverage-summary.json')
        if os.path.exists(summary_path):
            with open(summary_path, 'r') as f:
                data = json.load(f)
                coverage_pct = data['total']['statements']['pct']
                coverage_found = True
    except Exception as e:
        print(f"⚠️ Warning: Could not parse coverage summary: {e}")

    # SCORING LOGIC
    coverage_score = (coverage_pct / 100) * 40
    type_safety_score = max(0, (1 - (report['any_count'] / (report['total_lines'] / 10 if report['total_lines'] > 0 else 1))) * 30)
    
    core_files = report['total_files']
    doc_score = min(20, (report['jsdoc_count'] / core_files) * 5 if core_files > 0 else 0)
    health_score = 10 if len(report['oversized_files']) < 5 else 5
    
    total_score = coverage_score + type_safety_score + doc_score + health_score
    
    # FINAL REPORT
    print("="*40)
    print(" 🌊 VIBEENGINE RELIABILITY AUDIT REPORT v2 ")
    print("="*40)
    if not coverage_found:
        print("🚨 CRITICAL: Coverage report NOT FOUND!")
        print("👉 Run 'npm run test:coverage' first.")
        print("-" * 40)
    
    print(f"Core Files Analyzed:  {report['total_files']}")
    print(f"Total Lines of Code:  {report['total_lines']}")
    print(f"Statement Coverage:   {coverage_pct:.1f}%")
    print(f"Found 'any' Types:    {report['any_count']}")
    print(f"JSDoc Blocks:         {report['jsdoc_count']}")
    print("-" * 40)
    print(f"Coverage Score (Stmt): {coverage_score:.1f}/40.0")
    print(f"Type Safety Score:     {type_safety_score:.1f}/30.0")
    print(f"Documentation Score:   {doc_score:.1f}/20.0")
    print(f"Structural Health:     {health_score:.1f}/10.0")
    print("-" * 40)
    print(f"FINAL VIBE RELIABILITY SCORE (VRS): {total_score:.1f}/100.0")
    print("=" * 40)
    
    if total_score >= 90:
        print("ELITE STATUS: [SOVEREIGN] 🏛️")
    elif total_score >= 70:
        print("ELITE STATUS: [HIGH FIDELITY] 🚀")
    else:
        print("ELITE STATUS: [PROTOTYPE] 🧱")
    print("=" * 40)

if __name__ == "__main__":
    audit_project(os.getcwd())
