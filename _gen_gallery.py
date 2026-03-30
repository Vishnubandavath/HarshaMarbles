import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))


def sort_key(name):
    m = re.match(r"^(\d+)", name)
    return int(m.group(1)) if m else 99999


files = [f for f in os.listdir(ROOT) if f.lower().endswith((".jpeg", ".jpg", ".mp4"))]
files.sort(key=sort_key)

imgs = [f for f in files if f.lower().endswith((".jpeg", ".jpg"))]
vids = [f for f in files if f.lower().endswith(".mp4")]
# All images first, then all videos — videos sorted by number so e.g. 42.mp4 is last
vids.sort(key=sort_key)

lines = []
for f in imgs:
    n = f.split(".")[0]
    lines.append(
        f'            <div class="col"><article class="testimonial-card media-gallery-card h-100">'
        f'<button class="gallery-thumb gallery-thumb--in-card" type="button" data-gallery-img="./{f}" '
        f'aria-label="Open photo {n}"><img src="./{f}" alt="Marble polishing project photo {n}" '
        f'loading="lazy" decoding="async" /></button></article></div>'
    )
for f in vids:
    extra = ""
    if f.lower() == "42.mp4":
        extra = '<source src="./40.mp4" type="video/mp4" />'
    elif f.lower() == "40.mp4":
        extra = '<source src="./42.mp4" type="video/mp4" />'
    slug = f.replace(".", "-")
    label_id = f"gallery-video-{slug}-label"
    label_text = (
        f"After photo 41 — project video ({f})"
        if f.lower() == "42.mp4"
        else f"Project video ({f})"
    )
    lines.append(
        f'            <div class="col">\n'
        f'              <article class="testimonial-card media-gallery-card h-100">\n'
        f'                <p class="gallery-video-label mb-0 text-center small py-2 px-2" id="{label_id}">\n'
        f'                  {label_text}\n'
        f'                </p>\n'
        f'                <div class="media-gallery-card__video">\n'
        f'                  <video id="gallery-video-{slug}" class="gallery-video-el" controls muted playsinline preload="auto" poster="./1.jpeg" aria-labelledby="{label_id}" aria-label="Project video — tap play to watch">\n'
        f'                    <source src="./{f}" type="video/mp4" />\n'
        f"                    {extra}\n"
        f"                  </video>\n"
        f"                </div>\n"
        f"              </article>\n"
        f"            </div>"
    )

out = os.path.join(ROOT, "_gallery_grid.txt")
with open(out, "w", encoding="utf-8") as fp:
    fp.write("\n".join(lines) + "\n")

print("Wrote", len(lines), "items to", out)
print("Images:", len(imgs), "Videos:", len(vids))
