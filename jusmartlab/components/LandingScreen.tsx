import React, { useState, useEffect } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion';
import { JUColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LuArrowRight, LuCheck, LuMoon, LuZap, LuUsers,
    LuMonitor, LuShield, LuClock, LuGlobe, LuChevronDown, LuSun, LuMenu
} from 'react-icons/lu';

// Image Imports
const REMOTE_LOGO = "jusmartlab/app/assets/images/ju-logo.png"; // Clean JU Logo
const REMOTE_HERO = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop"; // Modern Computer Lab

// --- Sub-components ---

function CountUp({ end, duration = 2, suffix = '' }: { end: number, duration?: number, suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const incrementTime = (duration * 1000) / end;
        const step = end > 100 ? Math.ceil(end / (duration * 60)) : 1;

        const timer = setInterval(() => {
            start += step;
            if (start > end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime > 10 ? incrementTime : 16);

        return () => clearInterval(timer);
    }, [end, duration]);

    return <>{count}{suffix}</>;
}

function FeatureCard({ icon, title, desc, color }: any) {
    const { colors, isDark } = useTheme();
    return (
        <div
            style={{
                background: colors.card,
                padding: '30px',
                borderRadius: '24px',
                border: `1px solid ${colors.border} `,
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                // Re-applying original border
                e.currentTarget.style.border = `1px solid ${colors.border} `;
            }}
        >
            <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: `${color} 15`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '10px' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.6 }}>{desc}</p>
        </div>
    );
}

function StepRow({ num, title, desc }: any) {
    const { colors } = useTheme();
    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{
                fontSize: '14px', fontWeight: 700, color: JUColors.primary,
                background: `${JUColors.primary} 10`, padding: '4px 10px', borderRadius: '8px',
                height: 'fit-content',
            }}>{num}</span>
            <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>{title}</h4>
                <p style={{ fontSize: '15px', color: colors.textSecondary }}>{desc}</p>
            </div>
        </div>
    );
}

interface LandingScreenProps {
    onGetStarted: () => void;
}

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width < 1024 && width >= 768;

    const { isDark, toggleTheme, colors } = useTheme();

    if (Platform.OS !== 'web') return null;

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            background: colors.bg,
            fontFamily: '"Inter", sans-serif',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'background 0.3s ease',
        }}>
            {/* Navbar - Sticky */}
            <nav style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                padding: isMobile ? '16px 20px' : '20px 48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
                background: colors.navBg,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} `,
                transition: 'all 0.3s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: JUColors.primary,
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <img src={REMOTE_LOGO} alt="JU Logo" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: colors.text, margin: 0 }}>
                            {isMobile ? 'JU Smart Lab' : 'Jazeera University'}
                        </h1>
                        {!isMobile && <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textSecondary, letterSpacing: '0.5px' }}>SMART LAB SYSTEM</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '24px' }}>
                    {!isMobile && (
                        <>
                            <button style={navLinkStyle(colors.textSecondary)} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
                            <button style={navLinkStyle(colors.textSecondary)} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it Works</button>
                        </>
                    )}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }} onClick={toggleTheme}>
                        {isDark ? <LuSun size={20} color="#fbbf24" /> : <LuMoon size={20} color="#64748B" />}
                    </button>
                    {!isMobile && (
                        <button style={{
                            background: 'none', border: `1px solid ${colors.border} `,
                            padding: '8px 16px', borderRadius: '50px',
                            fontSize: '13px', fontWeight: 600, color: colors.text,
                            cursor: 'pointer',
                        }}>Admin Portal</button>
                    )}
                    {isMobile && <LuMenu size={24} color={colors.text} />}
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                width: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingTop: '80px',
                paddingBottom: '40px',
            }}>
                <div style={{
                    position: 'absolute', top: -100, right: -100, width: '50vw', height: '50vw',
                    background: isDark ? 'radial-gradient(circle, rgba(4,104,206,0.15) 0%, rgba(15,23,42,0) 70%)' : 'radial-gradient(circle, rgba(4,104,206,0.06) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: -1, pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: -50, left: -50, width: '40vw', height: '40vw',
                    background: isDark ? 'radial-gradient(circle, rgba(6,32,86,0.2) 0%, rgba(15,23,42,0) 70%)' : 'radial-gradient(circle, rgba(6,32,86,0.04) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: -1, pointerEvents: 'none',
                }} />

                <main style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row', // Responsive: Stack on mobile
                    padding: isMobile ? '20px 24px' : '0 80px',
                    alignItems: 'center',
                    gap: isMobile ? '40px' : '60px',
                    flex: 1,
                    marginTop: isMobile ? '40px' : '0',
                }}>
                    {/* Left Column */}
                    <div style={{ flex: 1, maxWidth: '600px', textAlign: isMobile ? 'center' : 'left' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: isDark ? 'rgba(4,104,206,0.2)' : '#eff6ff',
                                padding: '6px 14px', borderRadius: '99px',
                                border: isDark ? '1px solid rgba(4,104,206,0.3)' : '1px solid #dbeafe',
                                marginBottom: '32px',
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: JUColors.primary }} />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: JUColors.primary, letterSpacing: '0.5px' }}>NEW VERSION 2.0 LIVE</span>
                            </div>

                            <h1 style={{
                                fontSize: isMobile ? '42px' : '56px',
                                fontWeight: 800, color: colors.text, lineHeight: 1.1,
                                margin: '0 0 24px 0', letterSpacing: '-1.5px',
                            }}>
                                Welcome to <span style={{ color: JUColors.primary, fontStyle: 'italic' }}>JU</span>
                                <br />
                                Smart Lab
                            </h1>

                            <p style={{ fontSize: isMobile ? '16px' : '18px', color: colors.textSecondary, lineHeight: 1.6, maxWidth: '520px', margin: isMobile ? '0 auto 40px' : '0 0 40px 0' }}>
                                Streamline your lab experience. Report technical issues, track real-time status with Jazeera University's official system.
                            </p>

                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '20px', marginBottom: '60px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        background: JUColors.primary, color: '#fff', border: 'none',
                                        padding: '16px 32px', borderRadius: '14px', width: isMobile ? '100%' : 'auto',
                                        fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        boxShadow: '0 4px 12px rgba(4,104,206,0.2)',
                                    }}
                                    onClick={onGetStarted}
                                >
                                    Get Started <LuArrowRight size={18} />
                                </motion.button>

                                <div style={{
                                    background: isDark ? '#1e293b' : '#fff',
                                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                    padding: '16px 24px', borderRadius: '14px', width: isMobile ? '100%' : 'auto',
                                    fontSize: '15px', fontWeight: 600, color: colors.text,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                }}>
                                    System Status
                                    <LuCheck size={18} color={JUColors.tertiary} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '20px' : '40px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: 0 }}><CountUp end={500} suffix="+" /></h3>
                                    <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 500 }}>Workstations</span>
                                </div>
                                <div style={{ width: '1px', height: '30px', background: colors.border }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: 0 }}><CountUp end={1} /></h3>
                                    <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 500 }}>Active Lab</span>
                                </div>
                                <div style={{ width: '1px', height: '30px', background: colors.border }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: 0 }}>24/7</h3>
                                    <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 500 }}>Support</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Hero Image */}
                    {!isMobile && (
                        <motion.div
                            style={{ flex: 1.2, height: '100%', display: 'flex', justifyContent: 'center' }}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                                <motion.div
                                    style={{
                                        position: 'absolute', top: '40px', right: '-20px',
                                        background: colors.card, padding: '10px 16px', borderRadius: '14px',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                        display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10,
                                    }}
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LuZap color="#fff" size={20} />
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, fontWeight: 600 }}>Fast Response</span>
                                        <span style={{ fontSize: '10px', color: colors.textSecondary }}>Avg time &lt; 2hrs</span>
                                    </div>
                                </motion.div>

                                <div style={{
                                    width: '100%', borderRadius: '32px', overflow: 'hidden',
                                    boxShadow: isDark ? '0 32px 60px rgba(0,0,0,0.4)' : '0 32px 60px rgba(0,0,0,0.12)', height: '450px',
                                }}>
                                    <img
                                        src={REMOTE_HERO}
                                        alt="Computer Lab"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: isDark ? 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 40%)' : 'linear-gradient(to top, rgba(6,32,86,0.3) 0%, transparent 40%)',
                                        pointerEvents: 'none',
                                    }} />
                                </div>

                                <div style={{
                                    position: 'absolute', bottom: '30px', left: '-20px',
                                    background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '12px 20px', borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10,
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                                }}>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0f2fe', zIndex: 3, border: `2px solid ${colors.card} `, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LuUsers size={14} color={JUColors.primary} /></div>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', marginLeft: '-8px', zIndex: 2, border: `2px solid ${colors.card} ` }} />
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef2f2', marginLeft: '-8px', zIndex: 1, border: `2px solid ${colors.card} ` }} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Join 2,000+ students</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </main>
            </section>

            {/* Features Section */}
            <section id="features" style={{
                padding: isMobile ? '60px 24px' : '100px 80px',
                background: isDark ? '#020617' : '#f8fafc',
                transition: 'background 0.3s ease',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, color: colors.text, marginBottom: '16px' }}>Why JU Smart Lab?</h2>
                    <p style={{ fontSize: isMobile ? '16px' : '18px', color: colors.textSecondary }}>Built for stability, designed for speed.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', // Responsive Grid
                    gap: '30px',
                    maxWidth: '1200px', margin: '0 auto',
                }}>
                    <FeatureCard
                        icon={<LuMonitor size={24} />} title="Real-time Tracking"
                        desc="Track the status of every computer." color={JUColors.primary}
                    />
                    <FeatureCard
                        icon={<LuShield size={24} />} title="Secure Reporting"
                        desc="Verified student submission." color={JUColors.tertiary}
                    />
                    <FeatureCard
                        icon={<LuClock size={24} />} title="Rapid Resolution"
                        desc="Automated alerts for admins." color="#e67e22"
                    />
                    <FeatureCard
                        icon={<LuGlobe size={24} />} title="Campus Network"
                        desc="Accessible from anywhere." color={JUColors.secondary}
                    />
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" style={{ padding: isMobile ? '60px 24px' : '100px 80px', background: colors.bg, transition: 'background 0.3s' }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', alignItems: 'center', gap: '80px',
                }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, color: colors.text, marginBottom: '16px' }}>How It Works</h2>
                        <p style={{ fontSize: isMobile ? '16px' : '18px', color: colors.textSecondary }}>Report a problem in 3 simple steps.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', margin: '40px 0' }}>
                            <StepRow num="01" title="Scan or Select" desc="Identify your Lab and PC number." />
                            <StepRow num="02" title="Report Issue" desc="Select the category and describe the problem." />
                            <StepRow num="03" title="Get Fixed" desc="Admins are notified instantly for repairs." />
                        </div>

                        <motion.button
                            style={{
                                padding: '14px 28px', borderRadius: '12px',
                                background: isDark ? '#1e293b' : '#f1f5f9',
                                width: isMobile ? '100%' : 'auto',
                                color: colors.text, fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onGetStarted}
                        >
                            Start Reporting Now
                        </motion.button>
                    </div>

                    {!isMobile && (
                        <div style={{ flex: 1 }}>
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
                                alt="Working students"
                                style={{ width: '100%', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: JUColors.secondary, padding: isMobile ? '40px 24px' : '60px 80px 30px' }}>
                <div style={{
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start',
                    borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px', marginBottom: '30px', gap: isMobile ? '30px' : '0'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: isMobile ? 'center' : 'left' }}>
                        <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 10px' }}>JU Smart Lab</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Jazeera University</p>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '14px', cursor: 'pointer' }}>Privacy Policy</span>
                        <span style={{ color: '#cbd5e1', fontSize: '14px', cursor: 'pointer' }}>Terms of Service</span>
                        <span style={{ color: '#cbd5e1', fontSize: '14px', cursor: 'pointer' }}>Admin Login</span>
                    </div>
                </div>
                <div style={{ textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                    © 2026 Jazeera University. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

const navLinkStyle = (color: string): React.CSSProperties => ({
    background: 'none', border: 'none', fontSize: '14px', fontWeight: 500, color: color, cursor: 'pointer', transition: 'color 0.2s'
});
