# In-screen correction — QA

The prior companion-phone layout was a misinterpretation. The corrected implementation renders all nine case studies exactly once, inside actual phone screens, centered in the page. No separate right-hand portfolio column remains.

Desktop screenshots inspected: unfolded Duo, iPhone 11/Twitter, iPhone 4S/Tumblr at 1440×1000. Files: `../anonymous-portfolio-evidence/in-screen/`.

The native outer scroll drives the real content through clipped screen viewports. Forward and reverse movement, variable heights, language switching and reload recovery are covered by Chromium and WebKit tests. Mobile and no-JS versions retain the same content in full-height document flow. Physical iPhone Safari remains a manual validation limitation.

The full automated suite includes 16 browser checks plus 3 content tests. Tests now assert actual article ancestry inside screens, no duplicated project DOM and reproducible content transforms on reversal, instead of asserting decorative phone previews.
