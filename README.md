# Green Shell · Common Errors

The Common Errors course for the **OpenClaw MM Rubrics SINGLE TURN** project, Green Shell. Ten errors that keep
costing people their tasks, each with the rule it breaks, quoted from the Green Shell Guidelines or QC spec, and a
real Green Shell task showing it happen.

## → [pablitofott14.github.io/green-shell-common-errors](https://pablitofott14.github.io/green-shell-common-errors/)

That link is the course: 10 slides to step through with the arrow keys, full screen, a strip of every slide
and a link to each one (`#1` to `#10`). Every example number on a slide opens that real task on the exact
spot, and **Back to slides** returns you to the slide you left. The PDF and PPTX downloads keep the same links.

## The errors and their examples

| | Error | Examples |
|---|---|---|
| 1.1 | [The finished task drifts from its assigned parameters](mistakes/parameter-drift.html) | 1, 2 |
| 1.2 | [Images that are only pictures of text](mistakes/text-only-images.html) | 3 |
| 2.1 | [A process criterion where a completion criterion belongs](mistakes/process-not-outcome.html) | 4, 5 |
| 2.2 | [A criterion that only checks a file exists](mistakes/existence-check.html) | 6 |
| 2.3 | [An ask the rubric never grades](mistakes/ungraded-ask.html) | 7 |
| 3.1 | [The same check written twice](mistakes/same-check-twice.html) | 8 |
| 3.2 | [The weight rewards the restatement, not the reasoning](mistakes/weight-on-restatement.html) | 9 |
| 3.3 | [A category that does not say what the criterion grades](mistakes/category-mismatch.html) | 10 |
| 4.1 | [Fewer than ten subjective criteria](mistakes/subjective-count.html) | 11, 12 |
| 4.2 | [A subjective criterion outside Task Completion](mistakes/subjective-category.html) | 13 |

Slide 8, *Closing the Task*, covers the Leg B and golden checks QC fails a task on; it teaches the rules and carries no
example. Slide 1 sets out what changed from Red Shell: single turn, the 30% failure floor, the two automatic fails in
the rubric and the binding task parameters.

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The slides: one at a time, with the examples on each slide listed under it |
| `slides/<n>-<name>.html` and `.png` | Each slide as HTML, and its render at 1920x1080 |
| `slides/img/`, `slides/thumbs/` | The 3840x2160 renders the deck shows, and the strip's thumbnails |
| `slides/green-shell-common-errors-slides.pdf` | The deck as a PDF, printed from the slides, text kept as text |
| `slides/green-shell-common-errors-slides.pptx` | The deck as a PPTX, one picture per slide, the words and example links in the speaker notes |
| `mistakes/<error>.html` | One page per error: the mistake, what to do instead, each real example as a diagnosis, the rules in full |
| `evidence/<task>/` | The task inputs an example opens, metadata stripped |
| `assets/` | The shared stylesheet, the deck and the example viewer |

## What grounds it

**The rules come first.** Every error names the sections of the Green Shell Guidelines (v1, Sep 27 2026) and the QC
spec (V2) that make it an error, quoted word for word under the section title as the document prints it. The build
checks every quote against the document before it writes a page.

**The examples are real.** Every one is a task submitted to Green Shell. Every quoted line is checked against the
task's own text when the site is built; *What it should have been* is the course's correction, never presented as the
task's. Nothing here identifies a contributor. The task featured as a golden reference on the Golden Task Hub is not
used as an example of anything.

## Rebuilding

The site is generated. The build lives with the course material in Drive, under
`Red Shell/Green Shell/Project resources updates/common errors course/_build/`:

```bash
python build.py      # checks every quote against its source, renders the slides, writes this site
python check.py      # opens every page in headless Chrome: every slide, link, example, spot and evidence file
```

`course.py` holds what each error says, its rules and its examples; `slides.py` the slides; `pages.py` the
error pages and the deck. The Green Shell intro course this one sits beside is at
[MM-Rubrics-Multimodal-Slides-Green-Shell](https://pablitofott14.github.io/MM-Rubrics-Multimodal-Slides-Green-Shell/).
