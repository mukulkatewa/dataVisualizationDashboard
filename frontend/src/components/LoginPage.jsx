import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('admin@demo.com');
    const [password, setPassword] = useState('admin123');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin ? { email, password } : { email, password, name };

            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user, data.token);
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Side - Illustration with Character */}
            <div className="login-left">
                <div className="login-brand">
                    <div className="brand-logo">B</div>
                    <span className="brand-name">Blackcoffer</span>
                </div>

                <div className="login-illustration">
                    {/* Background Circle */}
                    <div className="bg-circle"></div>

                    {/* Profit Card - Top Left */}
                    <div className="illustration-card card-profit">
                        <div className="card-label">Profit</div>
                        <div className="card-sublabel">Last Month</div>
                        <div className="line-chart">
                            <svg viewBox="0 0 120 50" className="chart-svg">
                                <polyline
                                    fill="none"
                                    stroke="#00cfe8"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points="5,40 25,35 45,38 65,25 85,28 100,15 115,12"
                                />
                                <circle cx="115" cy="12" r="4" fill="#00cfe8" />
                            </svg>
                        </div>
                        <div className="card-metric">
                            <span className="metric-value">624k</span>
                            <span className="metric-change positive">+8.24%</span>
                        </div>
                    </div>

                    {/* Character Image */}
                    <img src="/login-character.png" alt="Character" className="character-image" />

                    {/* Order Card - Bottom Right */}
                    <div className="illustration-card card-order">
                        <div className="card-label">Order</div>
                        <div className="card-sublabel">Last week</div>
                        <div className="horizontal-bars">
                            <div className="h-bar" style={{ width: '70%' }}></div>
                            <div className="h-bar short" style={{ width: '30%' }}></div>
                            <div className="h-bar" style={{ width: '60%' }}></div>
                            <div className="h-bar" style={{ width: '85%' }}></div>
                            <div className="h-bar accent" style={{ width: '75%' }}></div>
                        </div>
                        <div className="card-metric">
                            <span className="metric-value">124k</span>
                            <span className="metric-change positive">+12.6%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <div className="login-form-container">
                    <div className="login-header">
                        <h1>Welcome to Blackcoffer! 👋</h1>
                        <p>Please sign-in to your account and start the adventure</p>
                    </div>

                    <div className="demo-credentials">
                        <p><span className="label">Admin Email:</span> admin@demo.com / Pass: <span className="label">admin123</span></p>
                        <p><span className="label">Client Email:</span> client@demo.com / Pass: <span className="label">client</span></p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label>Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input type="email" placeholder="admin@demo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type={showPassword ? 'text' : 'password'} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-link">Forgot Password?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>
                            {isLogin ? "New on our platform? " : "Already have an account? "}
                            <button type="button" onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Create an account' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
