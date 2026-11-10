import { Form, Input, Button, Typography, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  DashboardOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LoadingOutlined,
  RocketOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

const { Title, Text } = Typography;

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    // Small delay so the loading state is visible
    await new Promise(resolve => setTimeout(resolve, 600));
    const success = await login(values.email, values.password);
    setLoading(false);
    if (success) {
      message.success('Welcome back!');
      navigate('/dashboard');
    } else {
      message.error('Invalid credentials or not an admin');
    }
  };

  return (
    <>
      <style>{`
        .lp-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          overflow-x: hidden;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        /* ===== Left brand panel ===== */
        .lp-brand {
          flex: 1 1 55%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 64px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(150deg, #0f172a 0%, #1e2a78 55%, #4338ca 100%);
          color: #fff;
        }
        .lp-brand::before {
          content: '';
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%);
          top: -120px; right: -80px;
        }
        .lp-brand::after {
          content: '';
          position: absolute;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%);
          bottom: -100px; left: -60px;
        }
        .lp-brand-inner { position: relative; z-index: 1; max-width: 560px; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px; font-weight: 500;
          margin-bottom: 24px;
          backdrop-filter: blur(6px);
        }
        .lp-title {
          color: #fff !important;
          font-weight: 700 !important;
          margin: 0 0 12px !important;
          line-height: 1.15 !important;
        }
        .lp-subtitle {
          color: rgba(255,255,255,0.75) !important;
          margin: 0 0 40px !important;
          line-height: 1.6 !important;
          max-width: 460px;
        }
        .lp-features { display: grid; gap: 16px; margin-bottom: 36px; }
        .lp-feature {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 16px 18px;
          backdrop-filter: blur(8px);
          transition: transform 0.25s ease, background 0.25s ease;
        }
        .lp-feature:hover { transform: translateX(4px); background: rgba(255,255,255,0.12); }
        .lp-feature-icon {
          flex-shrink: 0;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          font-size: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(56,189,248,0.4));
          border: 1px solid rgba(255,255,255,0.15);
        }
        .lp-feature h4 { color: #fff; margin: 0 0 4px; font-size: 15px; font-weight: 600; }
        .lp-feature p { color: rgba(255,255,255,0.65); margin: 0; font-size: 13px; line-height: 1.5; }
        .lp-note {
          display: flex; gap: 10px; align-items: flex-start;
          font-size: 12.5px; color: rgba(255,255,255,0.55);
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 20px;
        }
        /* ===== Right form panel ===== */
        .lp-form-panel {
          flex: 1 1 45%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
          background: #f8fafc;
          position: relative;
        }
        .lp-card {
          width: 100%;
          max-width: 400px;
          box-sizing: border-box;
          background: #fff;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04);
        }
        .lp-logo {
          width: 56px; height: 56px;
          margin: 0 auto 18px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; color: #fff;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
        }
        .lp-card-title { text-align: center; color: #0f172a !important; margin: 0 0 6px !important; }
        .lp-card-sub { text-align: center; display: block; margin-bottom: 28px; }
        .lp-input.ant-input-affix-wrapper,
        .lp-input .ant-input {
          border-radius: 10px !important;
        }
        .lp-input.ant-input-affix-wrapper {
          padding: 10px 14px;
          border-color: #e2e8f0;
          transition: all 0.2s ease;
        }
        .lp-input.ant-input-affix-wrapper:hover { border-color: #94a3b8; }
        .lp-btn {
          height: 46px !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 15px;
          border: none !important;
          background: linear-gradient(135deg, #4f46e5, #6d28d9) !important;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .lp-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45); opacity: 0.95; }
        .lp-btn:active { transform: translateY(0); }
        .lp-footer { text-align: center; margin-top: 24px; }
        .lp-demo {
          margin-top: 16px;
          background: #eef2ff;
          border: 1px dashed #c7d2fe;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12.5px;
          color: #4338ca;
          text-align: center;
        }
        .lp-copyright { margin-top: 24px; font-size: 12px; color: #94a3b8; }

        /* ===== Responsive ===== */
        @media (max-width: 991px) {
          .lp-root { flex-direction: column-reverse; }
          .lp-brand { padding: 40px 28px; flex-basis: auto; }
          .lp-form-panel { flex-basis: auto; min-height: 100vh; min-height: 100dvh; }
          .lp-brand-inner { max-width: 100%; }
        }
        @media (max-width: 575px) {
          .lp-brand { padding: 32px 20px; }
          .lp-form-panel { padding: 32px 16px; }
          .lp-card { padding: 32px 20px; border-radius: 16px; max-width: calc(100vw - 24px); }
          .lp-features { gap: 12px; }
          .lp-feature { padding: 14px; }
          .lp-feature p { display: none; }
          .lp-note { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-feature, .lp-btn { transition: none; }
        }
      `}</style>

      <div className="lp-root">
        {/* ===== Brand panel ===== */}
        <div className="lp-brand">
          <div className="lp-brand-inner">
            <span className="lp-badge">
              <RocketOutlined /> PlaySpot Admin Portal
            </span>
            <Title level={1} className="lp-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Indoor Sports Hub
            </Title>
            <Text className="lp-subtitle" style={{ fontSize: 'clamp(14px, 1.6vw, 16px)' }}>
              The central command center for managing venues, bookings, users and
              payments — all in one secure place.
            </Text>

            <div className="lp-features">
              <div className="lp-feature">
                <div className="lp-feature-icon"><DashboardOutlined /></div>
                <div>
                  <h4>Smart Dashboard</h4>
                  <p>Real-time overview of facilities, bookings and revenue at a glance.</p>
                </div>
              </div>
              <div className="lp-feature">
                <div className="lp-feature-icon"><TeamOutlined /></div>
                <div>
                  <h4>User Management</h4>
                  <p>Oversee players, facility owners and staff from one unified panel.</p>
                </div>
              </div>
              <div className="lp-feature">
                <div className="lp-feature-icon"><SafetyCertificateOutlined /></div>
                <div>
                  <h4>Admin Controls</h4>
                  <p>Approvals, reports, analytics and full system configuration.</p>
                </div>
              </div>
            </div>

            <div className="lp-note">
              <TrophyOutlined style={{ fontSize: 16, marginTop: 2 }} />
              <span>
                Restricted area — authorized administrators only. Unauthorized access
                attempts may be logged and investigated.
              </span>
            </div>
          </div>
        </div>

        {/* ===== Form panel ===== */}
        <div className="lp-form-panel">
          <div className="lp-card">
            <div className="lp-logo"><CalendarOutlined /></div>
            <Title level={3} className="lp-title lp-card-title" style={{ fontSize: 24 }}>
              Welcome back
            </Title>
            <Text type="secondary" className="lp-card-sub">
              Sign in to your admin account to continue
            </Text>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label={<span style={{ fontWeight: 500 }}>Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  className="lp-input"
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500 }}>Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  className="lp-input"
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Enter your password"
                  iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="lp-btn"
                  block
                  disabled={loading}
                  icon={loading ? <LoadingOutlined /> : undefined}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            <div className="lp-demo">
              <strong>Demo credentials:</strong> admin@example.com / password
            </div>

            <div className="lp-footer">
              <Text type="secondary" style={{ fontSize: 13 }}>
                © {new Date().getFullYear()} Indoor Sports Hub. All rights reserved.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
