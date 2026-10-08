# Green Shell · Common Errors

The Common Errors course for the **OpenClaw MM Rubrics SINGLE TURN** project, Green Shell. It keeps the errors of the
[Red Shell Common Errors course](https://pablitofott14.github.io/red-shell-common-errors/) that the Green Shell Guidelines and QC spec still make errors, restates
each one against the Green Shell rules, and keeps their real Red Shell examples, which show issues that must not be
repeated in Green Shell: the same quality standards and expectations still apply.

## → [pablitofott14.github.io/green-shell-common-errors](https://pablitofott14.github.io/green-shell-common-errors/)

That link is the course: 13 slides to step through with the arrow keys, full screen, a strip of every slide
and a link to each one (`#1` to `#13`). Every example number on a slide opens that real Red Shell task on the
exact spot, and **Back to slides** returns you to the slide you left. The PDF and PPTX downloads keep the same links.

## The errors and their Red Shell examples

| | Error | Examples |
|---|---|---|
| 1.1 | [The deliverable sits below the complexity bar](mistakes/below-complexity-bar.html) | 1 |
| 1.2 | [The task relies on records the universe does not hold](mistakes/universe-missing-records.html) | 2 |
| 2.1 | [A prompt that answers its own attachment](mistakes/prompt-answers-attachment.html) | 3 |
| 2.2 | [A Leg B hint that hands Model B the answer](mistakes/steering-hands-answer.html) | 4, 5 |
| 3.1 | [A rubric that can only reward, never penalise](mistakes/no-negatives.html) | 6, 7 |
| 3.2 | [A requirement nothing grades, and a criterion nothing asked for](mistakes/coverage-both-ways.html) | 8, 9 |
| 3.3 | [Weights that do not separate difficulty from lookup](mistakes/weights-flat.html) | 10 |
| 3.4 | [More trajectory criteria than the Guidelines allow](mistakes/trajectory-cap.html) | 11 |
| 4.1 | [A criterion the golden itself fails](mistakes/golden-fails-own-criterion.html) | 12, 13 |
| 4.2 | [Criteria a correct run cannot pass, or a wrong one can](mistakes/unanswerable-criterion.html) | 14, 15, 16 |
| 4.3 | [Category and Evaluation Target filled with the wrong kind of value](mistakes/category-and-target.html) | 17, 18 |
| 4.4 | [The same check written twice](mistakes/same-check-twice.html) | 19 |
| 5.1 | [Subjective criteria that never name the file](mistakes/subjective-no-file.html) | 20 |
| 5.2 | [Too few subjective criteria](mistakes/subjective-size-and-share.html) | 21 |
| 5.3 | [Subjective criteria that require your golden's wording](mistakes/subjective-from-the-page.html) | 22 |
| 6.1 | [The golden states something its own sources contradict](mistakes/golden-contradicts-sources.html) | 23, 24 |
| 6.2 | [The five minute close out nobody runs](mistakes/closeout-mechanics.html) | 25, 26 |

Slide 7 also teaches Green Shell's failure floor, Model A failing at least 30% of the rubric, as a rule: the Red Shell
example for it failed 35%, enough under Green Shell. Slide 1 sets out what changed from Red Shell.

**Left out, because Green Shell has no such thing:** the three milestone errors, the deferred file that announces its
own turn, and the revision that leaves the old wording standing. Green Shell is one prompt and one answer.

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The slides: one at a time, with the Red Shell examples on each slide listed under it |
| `slides/<n>-<name>.html` and `.png` | Each slide as HTML, and its render at 1920x1080 |
| `slides/img/`, `slides/thumbs/` | The 3840x2160 renders the deck shows, and the strip's thumbnails |
| `slides/green-shell-common-errors-slides.pdf` | The deck as a PDF, printed from the slides, text kept as text |
| `slides/green-shell-common-errors-slides.pptx` | The deck as a PPTX, one picture per slide, the words and example links in the speaker notes |
| `mistakes/<error>.html` | One page per error: the mistake and what to do instead, its Red Shell examples, the Green Shell rules in full |
| `evidence/<task>/` | The task files a Red Shell example opens |
| `assets/` | The shared stylesheet, the deck and the example viewer |

## What grounds it

**The rules are Green Shell's.** Every error names the sections of the Green Shell Guidelines (v1, Sep 27 2026) and the
QC spec (V2) that make it an error, quoted word for word under the section title as the document prints it. The build
checks every quote against the document before it writes a page.

**The examples are Red Shell's, unchanged.** Each one is the Red Shell course's own example card and task, carried over
as that course shows it; only its number in this deck, a Red Shell label and the rule line, which names the Green Shell
rule the same mistake breaks, are new. The build checks each one against the Red Shell course's data. Nothing here
identifies a contributor.

## Rebuilding

The site is generated. The build lives with the course material in Drive, under
`Red Shell/Green Shell/Project resources updates/common errors course/_build/`:

```bash
python build.py      # checks every quote and example against its source, renders the slides, writes this site
python check.py      # opens every page in headless Chrome: every slide, link, example, spot and evidence file
```

`course.py` holds what each error says, its rules and which Red Shell examples it keeps; `redsrc.py` carries the
examples over; `slides.py` the slides; `pages.py` the error pages and the deck. The Green Shell intro course this one
sits beside is at
[MM-Rubrics-Multimodal-Slides-Green-Shell](https://pablitofott14.github.io/MM-Rubrics-Multimodal-Slides-Green-Shell/).
