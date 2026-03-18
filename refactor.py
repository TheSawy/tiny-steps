import os

SRC = "src"
APP_FILE = os.path.join(SRC, "App.jsx")

with open(APP_FILE, "r") as f:
    content = f.read()

os.makedirs(os.path.join(SRC, "components"), exist_ok=True)
os.makedirs(os.path.join(SRC, "utils"), exist_ok=True)

def find_component(content, marker):
    idx = content.find(marker)
    if idx == -1:
        return None, -1, -1
    line_start = content.rfind("\n", 0, idx) + 1
    check = content.rfind("\n", 0, line_start - 1) + 1
    if "// ===" in content[check:line_start]:
        for _ in range(3):
            prev = content.rfind("\n", 0, check - 1) + 1
            if "//" in content[prev:check]:
                check = prev
        line_start = check
    depth = 0
    i = idx
    started = False
    while i < len(content):
        if content[i] == "{": depth += 1; started = True
        elif content[i] == "}":
            depth -= 1
            if started and depth == 0:
                end = i + 1
                while end < len(content) and content[end] in "; \n": end += 1
                return content[line_start:end].strip(), line_start, end
        i += 1
    return None, -1, -1

components = [
    "Icon", "FontLoader", "Modal", "NextWindowBadge",
    "FeedLogger", "DiaperLogger", "SleepLogger",
    "ActivitiesPage", "WeightLogger", "AppointmentLogger", "VaccineAdder",
    "GrowthPage", "MilestonesPage", "SettingsPage",
    "EditEventForm", "Dashboard", "TrendsDashboard",
    "AuthScreen", "DoctorSummary", "Onboarding",
    "CalendarPage", "ChatPage",
]

dead = ["CalendarPage", "ChatPage"]
extracted = 0

for name in components:
    code, start, end = find_component(content, f"const {name}")
    if code is None:
        print(f"  SKIP {name} (not found)")
        continue
    lines = len(code.split("\n"))
    if name in dead:
        print(f"  DEAD {name}: {lines} lines")
        continue
    with open(os.path.join(SRC, "components", f"{name}.jsx"), "w") as f:
        f.write(code + "\n")
    extracted += 1
    print(f"  OK   {name}: {lines} lines")

# Extract useTimer + TimerDisplay together
code, _, _ = find_component(content, "const useTimer")
code2, _, _ = find_component(content, "const TimerDisplay")
if code and code2:
    with open(os.path.join(SRC, "components", "TimerDisplay.jsx"), "w") as f:
        f.write(code + "\n" + code2 + "\n")
    extracted += 1
    print(f"  OK   TimerDisplay + useTimer")

print(f"\nExtracted {extracted} components")
print(f"Dead code: {', '.join(dead)}")
print(f"\nFiles created in src/components/")
os.system(f"ls -la {SRC}/components/")
print("\nGit status:")
os.system("git status --short | head -20")
