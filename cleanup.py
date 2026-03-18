import os

with open("src/App.jsx", "r") as f:
    lines = f.readlines()

print(f"Original: {len(lines)} lines")

# Find CalendarPage and ChatPage boundaries to remove
remove_ranges = []

# Find each dead component
for dead_name in ["CalendarPage", "ChatPage"]:
    for i, line in enumerate(lines):
        if f"const {dead_name}" in line and "= (" in line:
            # Look back for comment headers
            start = i
            for back in range(1, 5):
                if start - back >= 0 and ("// ===" in lines[start - back] or lines[start - back].strip().startswith("//")):
                    start = start - back
                else:
                    break
            
            # Find end - next component or section
            end = i + 1
            depth = 0
            found_start = False
            for j in range(i, len(lines)):
                for ch in lines[j]:
                    if ch == "{": depth += 1; found_start = True
                    elif ch == "}":
                        depth -= 1
                        if found_start and depth == 0:
                            end = j + 1
                            # Skip trailing blank lines
                            while end < len(lines) and lines[end].strip() == "":
                                end += 1
                            break
                if found_start and depth == 0:
                    break
            
            remove_ranges.append((dead_name, start, end))
            print(f"  Remove {dead_name}: lines {start+1}-{end} ({end-start} lines)")
            break

# Also remove references to dead components in tab rendering and nav
removals_inline = []
for i, line in enumerate(lines):
    if 'tab === "calendar"' in line or 'tab === "chat"' in line:
        if "CalendarPage" in line or "ChatPage" in line:
            removals_inline.append(i)
            print(f"  Remove tab reference at line {i+1}: {line.strip()[:60]}...")

# Sort ranges in reverse order to remove from bottom up
remove_ranges.sort(key=lambda x: x[1], reverse=True)

# Remove dead components
for name, start, end in remove_ranges:
    del lines[start:end]
    # Adjust inline removals
    removals_inline = [r - (end - start) if r > end else r for r in removals_inline]

# Remove inline references (reverse order)
for i in sorted(removals_inline, reverse=True):
    if i < len(lines):
        removed = lines[i].strip()
        del lines[i]
        print(f"  Removed inline: {removed[:60]}...")

# Also clean up header title references
for i, line in enumerate(lines):
    if 'tab === "calendar" ? "Calendar"' in line:
        lines[i] = line.replace('tab === "calendar" ? "Calendar" : ', '')
    if 'tab === "chat" ? "AI Chat"' in line:
        lines[i] = line.replace('tab === "chat" ? "AI Chat" : ', '')

# Remove calendarEvents from INITIAL_STATE if still referenced
# (keep it for now since Firestore listener still uses it)

with open("src/App.jsx", "w") as f:
    f.writelines(lines)

print(f"\nCleaned: {len(lines)} lines")
print(f"Removed: {sum(e-s for _,s,e in remove_ranges) + len(removals_inline)} lines of dead code")
