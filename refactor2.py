import os

SRC = "src"
with open(os.path.join(SRC, "App.jsx"), "r") as f:
    lines = f.readlines()

os.makedirs(os.path.join(SRC, "components"), exist_ok=True)
os.makedirs(os.path.join(SRC, "utils"), exist_ok=True)

# Find component boundaries by line number
boundaries = []
for i, line in enumerate(lines):
    if line.startswith("const ") and "= (" in line and ("=>" in line or "=> {" in lines[min(i+1, len(lines)-1)]):
        name = line.split("const ")[1].split(" ")[0].split("=")[0].strip()
        if name[0].isupper():
            boundaries.append((name, i))
    elif line.startswith("export default function"):
        boundaries.append(("App", i))

# Sort and compute end of each component
boundaries.sort(key=lambda x: x[1])
print(f"Found {len(boundaries)} components:\n")

dead = ["CalendarPage", "ChatPage"]

for idx, (name, start) in enumerate(boundaries):
    if idx + 1 < len(boundaries):
        end = boundaries[idx + 1][1]
    else:
        end = len(lines)
    
    # Look back for comment headers
    header_start = start
    for back in range(1, 5):
        if start - back >= 0 and ("// ===" in lines[start - back] or lines[start - back].strip().startswith("//")):
            header_start = start - back
        else:
            break
    
    line_count = end - header_start
    
    if name in dead:
        print(f"  DEAD  {name}: lines {header_start+1}-{end} ({line_count} lines)")
        continue
    
    if name == "App":
        print(f"  MAIN  {name}: lines {header_start+1}-{end} ({line_count} lines)")
        continue
    
    component_code = "".join(lines[header_start:end])
    filepath = os.path.join(SRC, "components", f"{name}.jsx")
    with open(filepath, "w") as f:
        f.write(component_code)
    
    size = len(component_code)
    print(f"  OK    {name}: lines {header_start+1}-{end} ({line_count} lines, {size} bytes)")

# Also extract utility sections (lines 1 to first component)
first_comp = boundaries[0][1] if boundaries else len(lines)
utils_code = "".join(lines[:first_comp])
with open(os.path.join(SRC, "utils", "shared.js"), "w") as f:
    f.write(utils_code)
print(f"\n  UTILS shared.js: lines 1-{first_comp} ({first_comp} lines)")

print(f"\nDone! Check src/components/ and src/utils/")
os.system(f"wc -l {SRC}/components/*.jsx | tail -5")
