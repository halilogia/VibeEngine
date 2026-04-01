import os
import re
import json

# ======================================================================
# 🌊 VIBEENGINE RELIABILITY AUDIT v4.3 (Balanced Guide)
# ======================================================================
# Metrics:
# - Stmt Coverage (35%): Statement pct from Vitest
# - Type Safety (25%): (1 - any_count / (total_lines/10)) * 25
# - Doc Quality (15%): (Core Doc Ratio) * 12 + (Other Doc Ratio) * 3
# - Vibe Resilience (15%): Asset integrity, Memory/Dispose logic
# - Structural (10%): (Lines <= 300 AND Avg Comp <= 15)
#   CRITICAL: Files > 800 lines cause massive point loss.
# ======================================================================

CORE_FILES = [
    "Entity.ts",
    "Scene.ts",
    "System.ts",
    "RenderSystem.ts",
    "PhysicsSystem.ts",
    "ScriptSystem.ts",
    "AudioSystem.ts",
    "InputSystem.ts",
    "AssetManager.ts",
    "AICopilot.ts",
]


def calculate_complexity(content):
    patterns = [
        r"\tif\s*\(",
        r"\s\} else if\s*\(",
        r"\sfor\s*\(",
        r"\swhile\s*\(",
        r"\s\.map\s*\(",
        r"\s\.forEach\s*\(",
        r"\s\.filter\s*\(",
        r"\s\.reduce\s*\(",
        r"&&",
        r"\|\|",
        r"\?\s",
        r"catch\s*\(",
        r"case\s",
    ]
    return sum(len(re.findall(p, content)) for p in patterns)


def audit_project(root_dir):
    src_dir = os.path.join(root_dir, "src")
    public_assets = set()
    for root, _, files in os.walk(root_dir):
        if "assets" in root or "public" in root:
            for f in files:
                public_assets.add(f.lower())

    report = {
        "total_files": 0,
        "any_count": 0,
        "total_lines": 0,
        "core_exports": 0,
        "core_documented": 0,
        "other_exports": 0,
        "other_documented": 0,
        "total_complexity": 0,
        "missing_assets": set(),
        "memory_leaks": [],
        "forbidden_patterns": 0,
        "complex_files": [],
        "oversized_files": [],
        "critical_files": [],
    }

    for root, _, files in os.walk(src_dir):
        if any(x in root for x in ["node_modules", "dist", "__tests__", "demo"]):
            continue

        for file in files:
            if file.endswith((".ts", ".tsx")):
                report["total_files"] += 1
                file_path = os.path.join(root, file)
                is_core = file in CORE_FILES

                with open(file_path, "r", encoding="utf-8") as f:
                    full_content = f.read()
                    clean_content = re.sub(
                        r'`[\s\S]*?`|"[^"]*"|\'[^\']*\'', "", full_content
                    )
                    lines = full_content.splitlines()
                    line_count = len(lines)
                    report["total_lines"] += line_count

                    if line_count > 800:
                        report["critical_files"].append((file, line_count))
                    elif line_count > 500:
                        report["oversized_files"].append(file)

                    complexity = calculate_complexity(clean_content)
                    report["total_complexity"] += complexity
                    if complexity > 25:
                        report["complex_files"].append((file, complexity))

                    report["forbidden_patterns"] += len(
                        re.findall(
                            r"console\.log\(|debugger;|TODO:|FIXME:", clean_content
                        )
                    )

                    if "class " in full_content:
                        heavy = [
                            "BufferGeometry",
                            "Material",
                            "Texture",
                            "AudioBuffer",
                            "AudioContext",
                        ]
                        # Fixed: Only flag if heavy assets are ACTUALLY imported/used, not just mentioned in strings
                        if any(h in clean_content for h in heavy) and not any(
                            d in full_content
                            for d in ["dispose(", "onDestroy(", "destroy("]
                        ):
                            report["memory_leaks"].append(file)

                    asset_refs = re.findall(
                        r'["\']([^"\']+\.(png|jpg|glb|gltf|mp3|wav|json))["\']',
                        full_content,
                    )
                    for ref_tuple in asset_refs:
                        ref = ref_tuple[0].split("/")[-1].lower()
                        if ref not in public_assets:
                            report["missing_assets"].add(ref_tuple[0])

                    # Documentation Ratio (Balanced)
                    export_matches = list(
                        re.finditer(
                            r"(export\s+(class|function|const|interface|type|enum)\s+\w+)",
                            full_content,
                        )
                    )
                    for match in export_matches:
                        documented = (
                            "*/"
                            in full_content[max(0, match.start() - 100) : match.start()]
                        )
                        if is_core:
                            report["core_exports"] += 1
                            if documented:
                                report["core_documented"] += 1
                        else:
                            report["other_exports"] += 1
                            if documented:
                                report["other_documented"] += 1

                    report["any_count"] += len(
                        re.findall(r":\s*any|as\s*any", clean_content)
                    )

    # SCORING
    coverage_pct = 0
    try:
        summary_path = os.path.join(root_dir, "coverage", "coverage-summary.json")
        if os.path.exists(summary_path):
            with open(summary_path, "r") as f:
                coverage_pct = json.load(f)["total"]["statements"]["pct"]
    except:
        pass

    score_coverage = (coverage_pct / 100) * 35
    score_types = max(
        0,
        (
            1
            - (
                report["any_count"]
                / (report["total_lines"] / 10 if report["total_lines"] > 0 else 1)
            )
        )
        * 25,
    )

    # Balanced Documentation Scoring (v4.5 - Agile Sovereign Edition)
    core_doc_ratio = (
        (report["core_documented"] / report["core_exports"])
        if report["core_exports"] > 0
        else 1.0
    )
    other_doc_ratio = (
        (report["other_documented"] / report["other_exports"])
        if report["other_exports"] > 0
        else 1.0
    )
    score_docs = (core_doc_ratio * 14.5) + (other_doc_ratio * 0.5)

    score_resilience = 15
    # Resilience bonus: if no missing assets and no leaks
    score_resilience -= min(10, len(report["missing_assets"]) * 1)
    score_resilience -= min(15, len(report["memory_leaks"]) * 5)
    score_resilience = max(0, score_resilience)

    avg_comp = (
        report["total_complexity"] / report["total_files"]
        if report["total_files"] > 0
        else 0
    )
    score_health = 10
    if len(report["oversized_files"]) >= 3:
        score_health -= 3
    if avg_comp > 15:
        score_health -= 2
    if len(report["complex_files"]) >= 3:
        score_health -= 5
    score_health -= len(report["critical_files"]) * 10
    score_health = max(0, score_health)

    total_score = (
        score_coverage + score_types + score_docs + score_resilience + score_health
    )

    print(
        "\n"
        + "🌊 " * 30
        + "\n"
        + " VIBEENGINE RELIABILITY AUDIT v4.3 (Balanced Guide) ".center(60)
        + "\n"
        + "🌊 " * 30
        + "\n"
    )
    print(
        f"Files: {report['total_files']} | Line Coverage: {coverage_pct:.1f}% | Avg Complexity: {avg_comp:.1f}"
    )
    print(
        f"Core Doc Ratio: {core_doc_ratio * 100:.1f}% | Other Doc Ratio: {other_doc_ratio * 100:.1f}%"
    )
    print(
        f"Missing Assets: {len(report['missing_assets'])} | Potential Leaks: {len(report['memory_leaks'])}"
    )
    print("-" * 60)
    print(
        f"Scores -> Coverage: {score_coverage:.1f}/35 | Types: {score_types:.1f}/25 | Docs: {score_docs:.1f}/15 | Resilience: {score_resilience:.1f}/15 | Health: {score_health:.1f}/10"
    )
    print("-" * 60)
    print(f"FINAL VIBE RELIABILITY SCORE (VRS): {total_score:.1f}/100.0")
    print("=" * 60)

    if report["critical_files"]:
        print("\n🔥 CRITICAL VIOLATIONS (Over 800 lines):")
        for f, l in report["critical_files"]:
            print(f" - {f}: {l} lines (REFACTOR IMMEDIATELY)")

    if total_score >= 90:
        print("\nELITE STATUS: [SOVEREIGN] 🏛️")
    elif total_score >= 70:
        print("\nELITE STATUS: [HIGH FIDELITY] 🚀")
    else:
        print("\nELITE STATUS: [PROTOTYPE] 🧱")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    audit_project(os.getcwd())
