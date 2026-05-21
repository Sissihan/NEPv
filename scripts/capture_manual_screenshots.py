# -*- coding: utf-8 -*-
"""Capture UI screenshots for the English operation manual (Playwright + Vite preview)."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "manual-screenshots"
PREVIEW_PORT = 4173
BASE_URL = f"http://127.0.0.1:{PREVIEW_PORT}"


def resolve_node() -> str:
    node = shutil.which("node")
    if node:
        return node
    raise RuntimeError("Node.js not found on PATH — install Node 18+ and retry.")


def start_preview() -> subprocess.Popen:
    if not (ROOT / "dist" / "index.html").is_file():
        raise FileNotFoundError("dist/ missing — run: npm run build")
    node = resolve_node()
    return subprocess.Popen(
        [node, "node_modules/vite/bin/vite.js", "preview", "--port", str(PREVIEW_PORT), "--host", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def wait_server(page, timeout_s: float = 30.0) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        try:
            page.goto(BASE_URL, wait_until="domcontentloaded", timeout=3000)
            return
        except Exception:
            time.sleep(0.4)
    raise RuntimeError(f"Preview server not ready at {BASE_URL}")


def shot(page, name: str, *, selector: str | None = None, full_page: bool = False) -> str:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{name}.png"
    if selector:
        loc = page.locator(selector).first
        loc.wait_for(state="visible", timeout=10000)
        loc.screenshot(path=str(path))
    else:
        page.screenshot(path=str(path), full_page=full_page)
    return path.name


def scroll_to(page, selector: str) -> None:
    page.locator(selector).first.scroll_into_view_if_needed()
    page.wait_for_timeout(250)


def open_details(page, selector: str) -> None:
    loc = page.locator(selector).first
    loc.scroll_into_view_if_needed()
    if loc.evaluate("el => !el.open"):
        loc.locator("summary").click()
    page.wait_for_timeout(200)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    proc = start_preview()
    manifest: list[dict] = []

    def add(
        file: str,
        control_id: str,
        control_type: str,
        label: str,
        section: str,
        action: str,
        *,
        selector: str | None = None,
    ) -> None:
        manifest.append(
            {
                "file": file,
                "control_id": control_id,
                "control_type": control_type,
                "label": label,
                "section": section,
                "action": action,
                "selector": selector,
            }
        )

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            wait_server(page)
            page.wait_for_load_state("networkidle")
            page.select_option("#locale-select", "en")
            page.wait_for_timeout(400)

            # --- Navigation ---
            shot(page, "01-nav-bar", selector=".site-nav")
            add(
                "01-nav-bar.png",
                "nav-bar",
                "Region",
                "Top navigation bar",
                "Global navigation",
                "Fixed header: brand, section anchors (Definition through References), and locale selector.",
                selector=".site-nav",
            )

            nav_links = [
                ("#hero", "nav.home", "Definition"),
                ("#compare", "nav.compare", "Compare"),
                ("#playground", "nav.playground", "Lab"),
                ("#ai-tutor", "nav.aiTutor", "AI Tutor"),
                ("#pitfalls", "nav.pitfalls", "Pitfalls"),
                ("#references", "nav.references", "References"),
            ]
            for idx, (href, key, label) in enumerate(nav_links, start=2):
                fn = f"{idx:02d}-nav-{href[1:]}"
                sel = f'nav.site-nav a[href="{href}"]'
                shot(page, fn, selector=sel)
                add(
                    f"{fn}.png",
                    key,
                    "Link",
                    label,
                    "Global navigation",
                    f"Click to scroll smoothly to the “{label}” section ({href}).",
                    selector=sel,
                )

            shot(page, "08-lang-switcher", selector=".lang-switcher")
            add(
                "08-lang-switcher.png",
                "lang.switcher",
                "Region",
                "Locale selector",
                "Global navigation · Locale",
                "Choose English, Simplified Chinese, or Traditional Chinese; UI strings update immediately.",
                selector=".lang-switcher",
            )

            for loc, fn, opt_label in [
                ("en", "09-lang-en", "English"),
                ("zh-CN", "10-lang-zh-cn", "Simplified Chinese (zh-CN)"),
                ("zh-TW", "11-lang-zh-tw", "Traditional Chinese (zh-TW)"),
            ]:
                page.select_option("#locale-select", loc)
                page.wait_for_timeout(350)
                shot(page, fn, selector="#locale-select")
                add(
                    f"{fn}.png",
                    f"locale-select.{loc}",
                    "Dropdown",
                    opt_label,
                    "Global navigation · Locale",
                    f"Set #locale-select to “{opt_label}”; persisted in localStorage key nepv-lens-locale.",
                    selector="#locale-select",
                )
            page.select_option("#locale-select", "en")
            page.wait_for_timeout(300)

            # --- Intro band (Definition + Compare) ---
            scroll_to(page, ".intro-band")
            shot(page, "12-intro-band", selector=".intro-band")
            add(
                "12-intro-band.png",
                "intro.band",
                "Region",
                "Definition & Compare (side-by-side)",
                "Intro",
                "Read-only: NEPv definition (left) and linear EVP vs NEPv comparison (right), separated by a vertical divider.",
                selector=".intro-band",
            )

            scroll_to(page, "#hero")
            shot(page, "13-section-hero", selector="#hero")
            add(
                "13-section-hero.png",
                "section.hero",
                "Display",
                "Definition (Hero)",
                "Intro · Definition",
                "Read-only: problem statement, formula, and teaching notes.",
                selector="#hero",
            )

            scroll_to(page, "#compare")
            shot(page, "14-section-compare", selector="#compare")
            add(
                "14-section-compare.png",
                "section.compare",
                "Display",
                "Linear EVP vs NEPv",
                "Intro · Compare",
                "Read-only: two concept panels and footnote; no interactive controls.",
                selector="#compare",
            )

            # --- Playground / Lab ---
            scroll_to(page, "#playground")
            shot(page, "15-playground-overview", selector="#playground")
            add(
                "15-playground-overview.png",
                "section.playground",
                "Region",
                "Interactive lab (overview)",
                "Lab",
                "Two-column shell: compass, heatmap/spectrum, polar plot, iteration lab (left); setup drawer with model, sliders, freeze pitfall (right). AI Tutor sits below the shell.",
                selector="#playground",
            )

            shot(page, "16-lab-shell", selector=".lab-shell")
            add(
                "16-lab-shell.png",
                "lab.shell",
                "Region",
                "Lab workspace (compass + observe + controls)",
                "Lab",
                "Main teaching surface: vector compass, residual banner, observe zone, polar plot, iteration controls, and collapsible setup drawer.",
                selector=".lab-shell",
            )

            shot(page, "17-residual-banner", selector=".residual-formula-banner")
            add(
                "17-residual-banner.png",
                "playground.residualFormula",
                "Display",
                "Relative residual formula banner",
                "Lab",
                "Read-only: TeX and plain-text definition of r_rel(x, λ).",
                selector=".residual-formula-banner",
            )

            shot(page, "18-sidebar-drawer", selector=".lab-sidebar-drawer")
            add(
                "18-sidebar-drawer.png",
                "lab.sidebarDrawer",
                "Collapsible panel",
                "Model & controls drawer",
                "Lab · Setup",
                "Expand/collapse the right-hand setup drawer (model, parameters, λ guess, freeze pitfall, residual readout, reset).",
                selector=".lab-sidebar-drawer",
            )

            shot(page, "19-model-select-a", selector="#model-select")
            add(
                "19-model-select-a.png",
                "model-select",
                "Dropdown",
                "Toy model (Model A — rank-one 2×2)",
                "Lab · Model",
                "Select Model A; resets x and parameters and turns off freeze pitfall.",
                selector="#model-select",
            )

            open_details(page, ".lab-details")
            shot(page, "20-physical-details", selector=".lab-details[open]")
            add(
                "20-physical-details.png",
                "model.physical",
                "Collapsible",
                "Physical background (expanded)",
                "Lab · Model",
                "Expand the model details block under the setup drawer for physical context and analytic notes.",
                selector=".lab-details[open]",
            )

            shot(page, "21-slider-alpha", selector="#alpha")
            add(
                "21-slider-alpha.png",
                "alpha",
                "Slider",
                "α (coupling strength)",
                "Lab · Model A parameters",
                "Drag #alpha (approx. −1.5…1.5); numeric field syncs; A(x) and spectrum update live.",
                selector="#alpha",
            )

            shot(page, "22-slider-lambda", selector="#lambda")
            add(
                "22-slider-lambda.png",
                "lambda",
                "Slider",
                "λ guess (residual probe)",
                "Lab · Residual",
                "Drag #lambda (−1…4); changes displayed r(x, λ) without changing A(x).",
                selector="#lambda",
            )

            shot(page, "23-freeze-off", selector=".lab-freeze-row")
            add(
                "23-freeze-off.png",
                "freeze",
                "Checkbox",
                "Pitfall: freeze A at current x (unchecked)",
                "Lab · Pitfall",
                "Check #freeze to freeze A(x₀), show frozen heatmap/spectrum, and highlight the pitfall.",
                selector=".lab-freeze-row",
            )

            page.check("#freeze")
            page.wait_for_timeout(450)
            shot(page, "24-freeze-on", selector=".lab-freeze-row.is-active")
            add(
                "24-freeze-on.png",
                "freeze.checked",
                "Checkbox + badge",
                "Pitfall: freeze A (checked)",
                "Lab · Pitfall",
                "Shows inline ⚠ badge and frozen-spectrum column; reminds that linear EVP ≠ NEPv.",
                selector=".lab-freeze-row.is-active",
            )
            page.uncheck("#freeze")
            page.wait_for_timeout(300)

            shot(page, "25-status-card", selector=".lab-status-card")
            add(
                "25-status-card.png",
                "residual.metric",
                "Display",
                "Relative & absolute residual",
                "Lab · Residual",
                "Read-only metrics; color hints for low/high residual; Reset all restores defaults.",
                selector=".lab-status-card",
            )

            scroll_to(page, "#lab-compass")
            shot(page, "26-vector-compass", selector="#lab-compass .vector-compass")
            add(
                "26-vector-compass.png",
                "compass.svg",
                "Drag surface",
                "Vector compass (||x|| = 1)",
                "Lab · Vector",
                "Drag the blue handle on the unit circle; out-of-circle drags project back with a toast.",
                selector="#lab-compass .vector-compass",
            )

            scroll_to(page, "#lab-observe")
            shot(page, "27-observe-zone", selector="#lab-observe")
            add(
                "27-observe-zone.png",
                "viz.observe",
                "Display",
                "Heatmap & instantaneous spectrum",
                "Lab · Visualization",
                "A(x) heatmap and eigenvalue bars; extra column when freeze pitfall is on.",
                selector="#lab-observe",
            )

            scroll_to(page, "#lab-polar")
            shot(page, "28-polar-plot", selector="#lab-polar .polar-plot")
            add(
                "28-polar-plot.png",
                "polar-plot",
                "Display",
                "Polar residual plot r(θ)",
                "Lab · Visualization",
                "Residual on the unit circle; red marker at θ = 0; updates with parameters.",
                selector="#lab-polar .polar-plot",
            )

            scroll_to(page, "#lab-iteration")
            shot(page, "29-iteration-lab", selector="#lab-iteration .iteration-lab")
            add(
                "29-iteration-lab.png",
                "iteration.lab",
                "Region",
                "Iteration lab",
                "Lab · Iteration",
                "Mode selector, Play, Step, Reset far, Reset to reference; convergence summary below.",
                selector="#lab-iteration .iteration-lab",
            )

            shot(page, "30-iter-mode", selector="#iter-mode")
            add(
                "30-iter-mode.png",
                "iter-mode",
                "Dropdown",
                "Eigenvalue pick mode",
                "Lab · Iteration",
                "Choose max / min / closest eigenvalue for the fixed-point map.",
                selector="#iter-mode",
            )

            iter_buttons = [
                (
                    "31-btn-play",
                    ".iteration-lab .iteration-btn-group--primary button:nth-of-type(1)",
                    "iteration.play",
                    "Play",
                    "Auto-iterate from the PRD reference initial guess (up to 200 steps).",
                ),
                (
                    "32-btn-step",
                    ".iteration-lab .iteration-btn-group--primary button:nth-of-type(2)",
                    "iteration.step",
                    "Step",
                    "One fixed-point step; disabled after non-convergence limit.",
                ),
                (
                    "33-btn-reset-far",
                    ".iteration-lab .iteration-btn-group--secondary button:nth-of-type(1)",
                    "iteration.resetFar",
                    "Reset (far)",
                    "Jump to a deliberately poor initial vector to demonstrate sensitivity.",
                ),
                (
                    "34-btn-reset-ref",
                    ".iteration-lab .iteration-btn-group--secondary button:nth-of-type(2)",
                    "iteration.resetRef",
                    "Reset to reference",
                    "Restore baseline x and k = 0; clears non-convergence warning.",
                ),
            ]
            for fn, sel, cid, label, action in iter_buttons:
                shot(page, fn, selector=sel)
                add(f"{fn}.png", cid, "Button", label, "Lab · Iteration", action, selector=sel)

            # Model B
            page.select_option("#model-select", "diagonal-3x3")
            page.wait_for_timeout(500)
            shot(page, "35-model-select-b", selector="#model-select")
            add(
                "35-model-select-b.png",
                "model-select.b",
                "Dropdown",
                "Toy model (Model B — diagonal 3×3)",
                "Lab · Model",
                "Switch to Model B; exposes β₁–β₃ sliders and x₃ control.",
                selector="#model-select",
            )

            for fn, key, label in [
                ("36-slider-beta1", "beta1", "β₁"),
                ("37-slider-beta2", "beta2", "β₂"),
                ("38-slider-beta3", "beta3", "β₃"),
            ]:
                shot(page, fn, selector=f"#{key}")
                add(
                    f"{fn}.png",
                    key,
                    "Slider",
                    label,
                    "Lab · Model B parameters",
                    f"Adjust #{key} (diagonal scaling); eigenvalues track diagonal entries.",
                    selector=f"#{key}",
                )

            shot(page, "39-slider-x3", selector="#x3")
            add(
                "39-slider-x3.png",
                "x3",
                "Slider",
                "x₃ (unit sphere)",
                "Lab · Vector (3D)",
                "Set third component; works with compass x₁, x₂ under ||x|| = 1.",
                selector="#x3",
            )

            page.select_option("#model-select", "rank-one-2x2")
            page.wait_for_timeout(400)

            # --- AI Tutor (full-width below lab) ---
            scroll_to(page, "#ai-tutor")
            shot(page, "40-ai-tutor", selector="#ai-tutor .ai-tutor--centered")
            add(
                "40-ai-tutor.png",
                "ai-tutor",
                "Region",
                "AI Math Tutor",
                "AI Tutor",
                "Status chips, preset questions, and compose row; rule-based answers grounded in current r, λ, α, freeze, and iteration state.",
                selector="#ai-tutor .ai-tutor--centered",
            )

            shot(page, "41-ai-presets", selector=".ai-presets")
            add(
                "41-ai-presets.png",
                "ai.presets",
                "Buttons",
                "Preset questions",
                "AI Tutor",
                "One-click prompts (e.g. why not converging, explain freeze pitfall).",
                selector=".ai-presets",
            )

            # --- Pitfalls ---
            scroll_to(page, "#pitfalls")
            shot(page, "42-section-pitfalls", selector="#pitfalls")
            add(
                "42-section-pitfalls.png",
                "section.pitfalls",
                "Region",
                "Pitfalls & FAQ",
                "Pitfalls",
                "Horizontal layout: main pitfall card (freeze A) and FAQ grid; Try pitfall jumps to lab with freeze on.",
                selector="#pitfalls",
            )

            # --- References (collapsible) ---
            scroll_to(page, "#references")
            shot(page, "43-references-collapsed", selector="#references .refs-collapsible")
            add(
                "43-references-collapsed.png",
                "references.collapsed",
                "Collapsible",
                "References (collapsed)",
                "References",
                "Click summary to expand bibliography and teaching notes.",
                selector="#references .refs-collapsible",
            )
            open_details(page, "#references .refs-collapsible")
            shot(page, "44-references-open", selector="#references .refs-collapsible[open]")
            add(
                "44-references-open.png",
                "references.open",
                "Collapsible",
                "References (expanded)",
                "References",
                "Numbered citation list and intro paragraph.",
                selector="#references .refs-collapsible[open]",
            )

            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(300)
            shot(page, "45-footer", selector="footer")
            add(
                "45-footer.png",
                "footer",
                "Display",
                "Footer disclaimer",
                "Footer",
                "Read-only teaching-demo disclaimer.",
                selector="footer",
            )

            # --- Mobile ---
            page.set_viewport_size({"width": 375, "height": 812})
            page.goto(BASE_URL)
            page.wait_for_load_state("networkidle")
            page.select_option("#locale-select", "en")
            page.select_option("#model-select", "rank-one-2x2")
            scroll_to(page, "#playground")
            page.wait_for_timeout(450)

            shot(page, "46-mobile-numeric", selector=".compass-numeric.mobile-numeric")
            add(
                "46-mobile-numeric.png",
                "compass.numeric",
                "Number inputs",
                "x₁ / x₂ numeric fields (mobile)",
                "Lab · Mobile",
                "Shown at viewport ≤ 375px; edits normalize x to the unit sphere.",
                selector=".compass-numeric.mobile-numeric",
            )

            page.screenshot(path=str(OUT_DIR / "47-mobile-playground.png"), full_page=False)
            add(
                "47-mobile-playground.png",
                "viewport.mobile",
                "Viewport",
                "Mobile lab (375px)",
                "Mobile",
                "Touch-friendly compass, stacked observe zone, drawer setup controls.",
            )

            browser.close()
    finally:
        proc.terminate()
        proc.wait(timeout=10)

    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Captured {len(manifest)} items -> {OUT_DIR}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)
