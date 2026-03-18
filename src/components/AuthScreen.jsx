// ============================================================
// ============================================================
// AUTH SCREEN (Email signup/login + Join family)
// ============================================================
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("welcome"); // welcome | signup | login | join
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name || !babyName) return setError("Please fill all fields");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true); setError("");
    try {
      const { signUpEmail } = await import("./lib/auth.js");
      await signUpEmail(email, password, name, babyName, birthDate || null);
      onAuth();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return setError("Please fill all fields");
    setLoading(true); setError("");
    try {
      const { signInEmail } = await import("./lib/auth.js");
      await signInEmail(email, password);
      onAuth();
    } catch (e) { setError(e.message.includes("invalid") ? "Wrong email or password" : e.message); }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!email || !password || !name || !familyCode) return setError("Please fill all fields");
    if (familyCode.length !== 6) return setError("Family code must be 6 characters");
    setLoading(true); setError("");
    try {
      const { signUpAndJoin } = await import("./lib/auth.js");
      await signUpAndJoin(email, password, name, familyCode);
      onAuth();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inputStyle = { ...S.input, marginBottom: 12 };

  return (
    <>
      <FontLoader />
      <div style={{ ...S.app, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, minHeight: "100vh", paddingBottom: 24 }}>
        {mode === "welcome" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👶</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.03em" }}>Tiny Steps</h1>
            <p style={{ color: C.t2, fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>Track your baby's feeding, sleep, diapers, and milestones — together with your partner.</p>
            <button style={{ ...S.btn("primary"), width: "100%", padding: "16px", fontSize: 16 }} onClick={() => setMode("signup")}>Create Account</button>
            <button style={{ ...S.btn("ghost"), width: "100%", marginTop: 8 }} onClick={() => setMode("join")}>Join Partner's Account</button>
            <button style={{ ...S.btn("ghost"), width: "100%", marginTop: 4, fontSize: 13 }} onClick={() => setMode("login")}>Already have an account? Log in</button>
          </div>
        )}

        {mode === "signup" && (
          <div>
            <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setMode("welcome"); setError(""); }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create Account</h2>
            <p style={{ color: C.t2, marginBottom: 20 }}>You'll get a family code to share with your partner.</p>
            <label style={S.label}>Your Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed" />
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label style={S.label}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <label style={S.label}>Baby's Name</label>
            <input style={inputStyle} value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="Baby's name" />
            <label style={S.label}>Birth Date (optional)</label>
            <input style={inputStyle} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btn("primary"), width: "100%", opacity: loading ? 0.6 : 1 }} onClick={handleSignup} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        )}

        {mode === "join" && (
          <div>
            <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setMode("welcome"); setError(""); }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Join Partner</h2>
            <p style={{ color: C.t2, marginBottom: 20 }}>Enter the 6-digit family code your partner shared.</p>
            <label style={S.label}>Your Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label style={S.label}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <label style={S.label}>Family Code</label>
            <input style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 20, textAlign: "center" }} value={familyCode} onChange={(e) => setFamilyCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
            {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btn("primary"), width: "100%", opacity: loading ? 0.6 : 1 }} onClick={handleJoin} disabled={loading}>
              {loading ? "Joining..." : "Join Family"}
            </button>
          </div>
        )}

        {mode === "login" && (
          <div>
            <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setMode("welcome"); setError(""); }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Welcome Back</h2>
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label style={S.label}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btn("primary"), width: "100%", opacity: loading ? 0.6 : 1 }} onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================
// MAIN APP — Firebase-connected
// ============================================================
