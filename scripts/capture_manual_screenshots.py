# -*- coding: utf-8 -*-
"""Capture UI screenshots for the operation manual (Playwright + Vite preview)."""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "manual-screenshots"
PREVIEW_PORT = 4173
BASE_URL = f"http://127.0.0.1:{PREVIEW_PORT}"
NODE = Path(
    r"c:\Users\hanjianzhong\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe"
)
VITE_PREVIEW = ROOT / "node_modules" / "vite" / "bin" / "vite.js"


def start_preview() -> subprocess.Popen:
    if not (ROOT / "dist" / "index.html").is_file():
        raise FileNotFoundError("dist/ missing — run: npm run build")
    return subprocess.Popen(
        [str(NODE), str(VITE_PREVIEW), "preview", "--port", str(PREVIEW_PORT), "--host", "127.0.0.1"],
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
    page.wait_for_timeout(200)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    proc = start_preview()
    manifest: list[dict] = []

    def add(
        file: str,
        control_id: str,
        control_type: str,
        label_zh: str,
        section_zh: str,
        action_zh: str,
        *,
        selector: str | None = None,
    ) -> None:
        manifest.append(
            {
                "file": file,
                "control_id": control_id,
                "control_type": control_type,
                "label_zh": label_zh,
                "section_zh": section_zh,
                "action_zh": action_zh,
                "selector": selector,
            }
        )

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            wait_server(page)
            page.wait_for_load_state("networkidle")

            # --- Nav ---
            shot(page, "01-nav-bar", selector=".site-nav")
            add(
                "01-nav-bar.png",
                "nav-bar",
                "区域",
                "顶部导航栏",
                "全局导航",
                "固定于页面顶部，包含品牌、四个锚点链接与语言选择。",
                selector=".site-nav",
            )

            shot(page, "02-nav-brand", selector="a.brand")
            add(
                "02-nav-brand.png",
                "nav.brand",
                "链接",
                "NEPv Lens（品牌）",
                "全局导航",
                "单击回到首页（#hero）区域。",
                selector="a.brand",
            )

            for idx, (href, key, label) in enumerate(
                [
                    ("#hero", "nav.home", "首页"),
                    ("#compare", "nav.compare", "对比"),
                    ("#playground", "nav.playground", "实验室"),
                    ("#pitfalls", "nav.pitfalls", "误区"),
                ],
                start=3,
            ):
                fn = f"{idx:02d}-nav-link-{href[1:]}"
                shot(page, fn, selector=f'nav.site-nav a[href="{href}"]')
                add(
                    f"{fn}.png",
                    key,
                    "链接",
                    label,
                    "全局导航",
                    f"单击平滑滚动至「{label}」区块（{href}）。",
                    selector=f'nav.site-nav a[href="{href}"]',
                )

            # Language switcher — label + select + each option state
            shot(page, "07-lang-switcher", selector=".lang-switcher")
            add(
                "07-lang-switcher.png",
                "lang.switcher",
                "区域",
                "语言选择区",
                "全局导航 · 语言",
                "包含「语言」标签与下拉框，切换后整站文案即时更新。",
                selector=".lang-switcher",
            )

            shot(page, "08-lang-label", selector="label[for='locale-select']")
            add(
                "08-lang-label.png",
                "lang.label",
                "标签",
                "语言",
                "全局导航 · 语言",
                "标识下方下拉框用途；点击标签会聚焦到 #locale-select。",
                selector="label[for='locale-select']",
            )

            locales = [
                ("en", "09-lang-en", "English"),
                ("zh-CN", "10-lang-zh-cn", "简体中文"),
                ("zh-TW", "11-lang-zh-tw", "繁體中文"),
            ]
            for loc, fn, opt_label in locales:
                page.select_option("#locale-select", loc)
                page.wait_for_timeout(350)
                shot(page, fn, selector="#locale-select")
                add(
                    f"{fn}.png",
                    f"locale-select.{loc}",
                    "下拉选项",
                    opt_label,
                    "全局导航 · 语言",
                    f"在 #locale-select 中选择「{opt_label}」；写入 localStorage 键 nepv-lens-locale。",
                    selector="#locale-select",
                )

            page.select_option("#locale-select", "zh-CN")
            page.wait_for_timeout(300)

            # --- Hero ---
            scroll_to(page, "#hero")
            shot(page, "12-section-hero", selector="#hero")
            add(
                "12-section-hero.png",
                "section.hero",
                "展示区",
                "首页（Hero）",
                "首页",
                "只读：NEPv 定义、公式与教学说明，无按钮。",
                selector="#hero",
            )

            # --- Compare ---
            scroll_to(page, "#compare")
            shot(page, "13-section-compare", selector="#compare")
            add(
                "13-section-compare.png",
                "section.compare",
                "展示区",
                "线性 EVP vs NEPv 对比",
                "对比",
                "只读：左右两张概念卡片与底部注释，无交互控件。",
                selector="#compare",
            )

            # --- Playground ---
            scroll_to(page, "#playground")
            shot(page, "14-playground-overview", selector="#playground")
            add(
                "14-playground-overview.png",
                "section.playground",
                "区域",
                "实验室总览（三栏布局）",
                "实验室",
                "左侧：模型选择、参数滑块、AI 提问框；中间：罗盘、Polar Plot、热图、谱图；右侧：AI 数学助教侧边栏（实时状态 + 交互提问）。",
                selector="#playground",
            )

            shot(page, "15-residual-banner", selector=".residual-formula-banner")
            add(
                "15-residual-banner.png",
                "playground.residualFormula",
                "展示区",
                "归一化残差公式横幅",
                "实验室",
                "只读：永久显示 r(x,λ) 的 TeX 与纯文本公式（PRD §5.1）。",
                selector=".residual-formula-banner",
            )

            shot(page, "16-model-select-a", selector="#model-select")
            add(
                "16-model-select-a.png",
                "model-select",
                "下拉框",
                "玩具模型（当前：模型 A）",
                "实验室 · 模型",
                "在 #model-select 中选择「模型 A — 秩一依赖（2×2）」；切换后重置 x 与参数并关闭 Pitfall。",
                selector="#model-select",
            )

            shot(page, "16b-physical-note", selector=".physical-note")
            add(
                "16b-physical-note.png",
                "model.physical",
                "展示区",
                "物理背景说明",
                "实验室 · 模型",
                "模型 A 关联「光子晶体 / 量子点耦合」，解释 α 如何影响物理系统行为。",
                selector=".physical-note",
            )

            shot(page, "17-slider-alpha", selector="#alpha")
            add(
                "17-slider-alpha.png",
                "alpha",
                "滑块",
                "α（耦合强度）",
                "实验室 · 模型 A 参数",
                "拖动 #alpha（范围约 -1.5～1.5）；右侧数值实时更新，A(x) 与谱联动。",
                selector="#alpha",
            )

            shot(page, "18-slider-lambda", selector="#lambda")
            add(
                "18-slider-lambda.png",
                "lambda",
                "滑块",
                "λ 猜测值（残差）",
                "实验室 · 残差",
                "拖动 #lambda（-1～4）；改变 r(x,λ) 显示，不改变 A(x) 本身。",
                selector="#lambda",
            )

            shot(page, "19-checkbox-freeze-off", selector=".pitfall-toggle")
            add(
                "19-checkbox-freeze-off.png",
                "freeze",
                "复选框",
                "误区：冻结当前 x 处的 A（未勾选）",
                "实验室 · Pitfall",
                "勾选 #freeze 后冻结 A(x₀) 并显示对比热图/谱；再次单击取消。",
                selector=".pitfall-toggle",
            )

            page.check("#freeze")
            page.wait_for_timeout(400)
            shot(page, "20-checkbox-freeze-on", selector=".pitfall-toggle")
            add(
                "20-checkbox-freeze-on.png",
                "freeze.checked",
                "复选框 + 徽章",
                "误区：冻结（已勾选）",
                "实验室 · Pitfall",
                "显示红色 Pitfall 徽章与 tooltip；右侧出现 A(x₀) 热图与冻结谱。",
                selector=".pitfall-toggle",
            )
            page.uncheck("#freeze")
            page.wait_for_timeout(300)

            shot(page, "21-residual-metric", selector=".playground-grid aside .card:has(.metric)")
            add(
                "21-residual-metric.png",
                "residual.metric",
                "展示区",
                "残差 r(x, λ) 数值",
                "实验室 · 残差",
                "只读：当前 x 与 λ 下的归一化残差（六位小数）。",
                selector=".playground-grid aside .card:has(.metric)",
            )

            shot(page, "22-iteration-lab", selector=".iteration-lab")
            add(
                "22-iteration-lab.png",
                "iteration.lab",
                "区域",
                "迭代实验室",
                "实验室 · 迭代",
                "含三个按钮：播放、单步、重置为参考初值。",
                selector=".iteration-lab",
            )

            for fn, sel, cid, label, action in [
                (
                    "23-btn-iteration-play",
                    ".iteration-lab button:nth-of-type(1)",
                    "iteration.play",
                    "播放",
                    "从 PRD 参考初值自动迭代（最多 200 步）并更新 x 与 r。",
                ),
                (
                    "24-btn-iteration-step",
                    ".iteration-lab button:nth-of-type(2)",
                    "iteration.step",
                    "单步",
                    "执行一步不动点型迭代；未收敛达上限后该按钮禁用。",
                ),
                (
                    "25-btn-iteration-reset",
                    ".iteration-lab button:nth-of-type(3)",
                    "iteration.resetRef",
                    "重置为参考初值",
                    "恢复基线 x 与步数 k=0，清除未收敛警告。",
                ),
            ]:
                shot(page, fn, selector=sel)
                add(f"{fn}.png", cid, "按钮", label, "实验室 · 迭代", action, selector=sel)

            shot(page, "26-vector-compass", selector=".vector-compass")
            add(
                "26-vector-compass.png",
                "compass.svg",
                "拖拽区",
                "向量罗盘（||x||=1）",
                "实验室 · 向量",
                "在 SVG 圆盘上拖动蓝色端点设置 x 方向；拖出圆外会投影并 toast 提示归一化。",
                selector=".vector-compass",
            )

            shot(page, "27-heatmap-spectrum", selector=".playground-grid > main")
            add(
                "27-heatmap-spectrum.png",
                "viz.main",
                "展示区",
                "热图与瞬时谱",
                "实验室 · 可视化",
                "只读：A(x) 热图、特征值条形图；Pitfall 开启时出现冻结对比列。",
                selector=".playground-grid > main",
            )

            shot(page, "27b-polar-plot", selector=".polar-plot")
            add(
                "27b-polar-plot.png",
                "polar-plot",
                "展示区",
                "残差极坐标图 r(θ)",
                "实验室 · 可视化",
                "显示残差在单位圆上的分布，红色点标记 θ=0 方向；实时响应参数变化。",
                selector=".polar-plot",
            )

            shot(page, "27c-ai-tutor", selector=".ai-tutor")
            add(
                "27c-ai-tutor.png",
                "ai-tutor",
                "侧边栏",
                "AI 数学助教（AI-assisted, human-verified）",
                "实验室 · AI",
                "右侧固定侧边栏：实时显示残差、λ、α 等状态；支持自然语言提问，AI 返回基于当前参数的收敛建议与误区解释；响应由规则模板生成，人工核验通过。",
                selector=".ai-tutor",
            )

            # Model B + x3
            page.select_option("#model-select", "diagonal-3x3")
            page.wait_for_timeout(500)
            shot(page, "28-model-select-b", selector="#model-select")
            add(
                "28-model-select-b.png",
                "model-select.b",
                "下拉框",
                "玩具模型（当前：模型 B）",
                "实验室 · 模型",
                "选择「模型 B — 对角缩放（3×3）」；显示 β₁/β₂/β₃ 与 x₃ 滑块。",
                selector="#model-select",
            )

            for fn, key, label in [
                ("29-slider-beta1", "beta1", "β₁"),
                ("30-slider-beta2", "beta2", "β₂"),
                ("31-slider-beta3", "beta3", "β₃"),
            ]:
                shot(page, fn, selector=f"#{key}")
                add(
                    f"{fn}.png",
                    key,
                    "滑块",
                    label,
                    "实验室 · 模型 B 参数",
                    f"拖动 #{key} 改变对角缩放强度；特征值即对角元。",
                    selector=f"#{key}",
                )

            shot(page, "32-slider-x3", selector="#x3")
            add(
                "32-slider-x3.png",
                "x3",
                "滑块",
                "x₃（单位球面）",
                "实验室 · 向量（3D）",
                "拖动 #x3 调节第三分量；与罗盘 x₁,x₂ 共同满足 ||x||=1。",
                selector="#x3",
            )

            # Pitfalls section
            scroll_to(page, "#pitfalls")
            shot(page, "33-section-pitfalls", selector="#pitfalls")
            add(
                "33-section-pitfalls.png",
                "section.pitfalls",
                "展示区",
                "常见误区与 FAQ",
                "误区",
                "只读：冻结 A 说明、尺度/NEP/复特征值等条目，无按钮。",
                selector="#pitfalls",
            )

            # Footer
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(300)
            shot(page, "34-footer", selector="footer")
            add(
                "34-footer.png",
                "footer",
                "展示区",
                "页脚免责声明",
                "页脚",
                "只读：教学演示声明。",
                selector="footer",
            )

            # Mobile viewport (≤375px) — numeric inputs visible per index.css
            page.set_viewport_size({"width": 375, "height": 812})
            page.goto(BASE_URL)
            page.wait_for_load_state("networkidle")
            page.select_option("#locale-select", "zh-CN")
            page.select_option("#model-select", "rank-one-2x2")
            scroll_to(page, "#playground")
            page.wait_for_timeout(400)

            shot(page, "35-numeric-x1", selector=".compass-numeric label:first-of-type")
            add(
                "35-numeric-x1.png",
                "compass.numericX1",
                "数字输入",
                "x₁（数值）",
                "实验室 · 向量（移动端）",
                "在宽度 ≤375px 时显示；输入 x₁ 后自动归一化，范围 [-1,1]。",
                selector=".compass-numeric label:first-of-type",
            )

            shot(page, "36-numeric-x2", selector=".compass-numeric label:last-of-type")
            add(
                "36-numeric-x2.png",
                "compass.numericX2",
                "数字输入",
                "x₂（数值）",
                "实验室 · 向量（移动端）",
                "与罗盘拖拽、x₃ 滑块（模型 B）共同决定单位球面上的 x。",
                selector=".compass-numeric label:last-of-type",
            )

            page.screenshot(path=str(OUT_DIR / "37-mobile-playground.png"))
            add(
                "37-mobile-playground.png",
                "viewport.mobile",
                "视口",
                "移动端实验室（375px）",
                "移动端",
                "触控拖动罗盘；x₁/x₂ 数值输入与可横向滑动热图；谱图纵向堆叠。",
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
