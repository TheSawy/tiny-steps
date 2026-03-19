import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { Icon } from "./Icon.jsx";

// ============================================================
// ONBOARDING
// ============================================================
export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0=welcome, 1=signup, 2=login, 3=baby, 4=join
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) return;
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const { signUpEmail } = await import("../lib/auth.js");
      await signUpEmail(email, password, name, babyName || "Baby", birthDate || null);
      // Auth state listener in App will pick this up
    } catch (e) {
      setError(e.message.includes("email-already-in-use") ? "This email is already registered. Try logging in." : e.message);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const { signInEmail } = await import("../lib/auth.js");
      await signInEmail(email, password);
    } catch (e) {
      setError(e.message.includes("invalid-credential") ? "Wrong email or password." : e.message);
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name || !email || !password || familyCode.length !== 6) return;
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const { signUpAndJoin } = await import("../lib/auth.js");
      await signUpAndJoin(email, password, name, familyCode);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const ErrorMsg = () => error ? <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEE2E2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div> : null;

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, minHeight: "100vh", paddingBottom: 24 }}>
      {step === 0 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👶</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.03em" }}>Tiny Steps</h1>
          <p style={{ color: C.t2, fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>Track your baby's feeding, sleep, diapers, and milestones — together with your partner.</p>
          <button style={{ ...S.btn("primary"), width: "100%", padding: "16px", fontSize: 16 }} onClick={() => setStep(1)}>Create Account</button>
          <button style={{ ...S.btn("secondary"), width: "100%", marginTop: 12 }} onClick={() => setStep(4)}>
            <Icon name="link" size={16} color={C.pri} /> Join Partner's Account
          </button>
          <button style={{ ...S.btn("ghost"), width: "100%", marginTop: 8 }} onClick={() => setStep(2)}>Already have an account? Log in</button>
        </div>
      )}

      {/* SIGN UP */}
      {step === 1 && (
        <div>
          <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setStep(0); setError(""); }}><Icon name="back" size={18} /> Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Create Account</h2>
          <ErrorMsg />
          <label style={S.label}>Your Name</label>
          <input style={{ ...S.input, marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed" />
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@example.com" />
          <label style={S.label}>Password</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <label style={S.label}>Baby's Name</label>
          <input style={{ ...S.input, marginBottom: 12 }} value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="Baby's name" />
          <label style={S.label}>Birth Date (optional)</label>
          <input style={S.input} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <p style={{ fontSize: 12, color: C.t3, marginTop: 8, marginBottom: 16 }}>Leave blank if not born yet.</p>
          <button style={{ ...S.btn("primary"), width: "100%", opacity: name && email && password ? 1 : 0.5 }} onClick={handleSignUp} disabled={loading}>
            {loading ? "Creating..." : "Create Account & Start"}
          </button>
        </div>
      )}

      {/* LOGIN */}
      {step === 2 && (
        <div>
          <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setStep(0); setError(""); }}><Icon name="back" size={18} /> Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Log In</h2>
          <ErrorMsg />
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@example.com" />
          <label style={S.label}>Password</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          <button style={{ ...S.btn("primary"), width: "100%", opacity: email && password ? 1 : 0.5 }} onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      )}

      {/* JOIN PARTNER */}
      {step === 4 && (
        <div>
          <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setStep(0); setError(""); }}><Icon name="back" size={18} /> Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Join Partner</h2>
          <p style={{ color: C.t2, marginBottom: 24 }}>Create your account and enter the family code your partner shared.</p>
          <ErrorMsg />
          <label style={S.label}>Your Name</label>
          <input style={{ ...S.input, marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          <label style={S.label}>Password</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <label style={S.label}>Family Code</label>
          <input style={{ ...S.input, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 20, textAlign: "center" }} value={familyCode} onChange={(e) => setFamilyCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
          <button style={{ ...S.btn("primary"), width: "100%", marginTop: 24, opacity: name && email && password && familyCode.length === 6 ? 1 : 0.5 }} onClick={handleJoin} disabled={loading}>
            {loading ? "Joining..." : "Join Family"}
          </button>
        </div>
      )}
    </div>
  );
};
