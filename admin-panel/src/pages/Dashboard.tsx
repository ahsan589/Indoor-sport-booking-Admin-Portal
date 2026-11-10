import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Tag, Empty } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  WarningOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

const { Title, Text } = Typography;

interface DashboardStats {
  totalUsers: number;
  totalOwners: number;
  totalPlayers: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalPayments: number;
  successPayments: number;
  totalRevenue: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  bookingsTrend: { date: string; bookings: number; revenue: number }[];
  usersByRole: { name: string; value: number }[];
  paymentMethods: { name: string; value: number }[];
  complaintsByStatus: { name: string; value: number }[];
  topGrounds: { name: string; bookings: number; revenue: number }[];
}

const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [usersSnap, bookingsSnap, paymentsSnap, playerComplaintsSnap, ownerComplaintsSnap] =
          await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'bookings')),
            getDocs(collection(db, 'payments')),
            getDocs(collection(db, 'player_complaints')),
            getDocs(collection(db, 'owner_complaints'))
          ]);

        const users = usersSnap.docs.map(d => d.data());
        const bookings = bookingsSnap.docs.map(d => d.data());
        const payments = paymentsSnap.docs.map(d => d.data());
        const complaints = [
          ...playerComplaintsSnap.docs.map(d => d.data()),
          ...ownerComplaintsSnap.docs.map(d => d.data())
        ];


        // --- Aggregations ---
        const totalUsers = users.length;
        const totalOwners = users.filter(u => u.role === 'owner').length;
        const totalPlayers = users.filter(u => u.role === 'player').length;

        const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

        const successPayments = payments.filter(p => p.status === 'success').length;
        const totalRevenue = payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
        const pendingComplaints = complaints.filter(c => c.status !== 'resolved').length;

        // Bookings trend: group by day for last 30 days
        const trendMap: { [key: string]: { bookings: number; revenue: number } } = {};
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trendMap[key] = { bookings: 0, revenue: 0 };
        }
        bookings.forEach(b => {
          const raw = b.createdAt || b.date;
          if (!raw) return;
          const date = typeof raw.toDate === 'function' ? raw.toDate() : new Date(raw);
          if (isNaN(date.getTime())) return;
          const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (trendMap[key]) {
            trendMap[key].bookings += 1;
            trendMap[key].revenue += Number(b.totalAmount) || 0;
          }
        });
        const bookingsTrend = Object.entries(trendMap).map(([date, v]) => ({ date, ...v }));

        // Users by role
        const usersByRole = [
          { name: 'Players', value: totalPlayers },
          { name: 'Owners', value: totalOwners },
          { name: 'Admins', value: users.filter(u => u.role === 'admin').length }
        ].filter(r => r.value > 0);

        // Payment methods distribution
        const methodMap: { [key: string]: number } = {};
        payments.forEach(p => {
          const m = (p.paymentMethod || p.method || 'Other').toString();
          methodMap[m] = (methodMap[m] || 0) + 1;
        });
        const paymentMethods = Object.entries(methodMap).map(([name, value]) => ({ name, value }));

        // Complaints by status
        const statusMap: { [key: string]: number } = {};
        complaints.forEach(c => {
          const s = (c.status || 'pending').toString();
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        const complaintsByStatus = Object.entries(statusMap).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));

        // Top grounds by bookings
        const groundMap: { [key: string]: { bookings: number; revenue: number } } = {};
        bookings.forEach(b => {
          const g = (b.groundName || b.ground || 'Unknown').toString();
          if (!groundMap[g]) groundMap[g] = { bookings: 0, revenue: 0 };
          groundMap[g].bookings += 1;
          groundMap[g].revenue += Number(b.totalAmount) || 0;
        });
        const topGrounds = Object.entries(groundMap)
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5);

        setStats({
          totalUsers, totalOwners, totalPlayers,
          totalBookings: bookings.length,
          confirmedBookings, pendingBookings, cancelledBookings,
          totalPayments: payments.length,
          successPayments, totalRevenue,
          totalComplaints: complaints.length,
          resolvedComplaints, pendingComplaints,
          bookingsTrend, usersByRole, paymentMethods, complaintsByStatus, topGrounds
        });
      } catch (err) {
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const chartTooltipStyle = {
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(15,23,42,0.08)'
  };

  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <TeamOutlined />,
      color: '#4F46E5',
      bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
      sub: `${stats.totalOwners} owners • ${stats.totalPlayers} players`
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <CalendarOutlined />,
      color: '#06B6D4',
      bg: 'linear-gradient(135deg, #ecfeff, #cffafe)',
      sub: `${stats.confirmedBookings} confirmed • ${stats.pendingBookings} pending`
    },
    {
      title: 'Revenue',
      value: stats.totalRevenue,
      icon: <CreditCardOutlined />,
      color: '#10B981',
      bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      sub: `${stats.successPayments} successful payments`,
      prefix: 'Rs '
    },
    {
      title: 'Complaints',
      value: stats.totalComplaints,
      icon: <WarningOutlined />,
      color: '#F59E0B',
      bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      sub: `${stats.resolvedComplaints} resolved • ${stats.pendingComplaints} open`
    }
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* ===== Header ===== */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Dashboard Overview</Title>
        <Text type="secondary">Live metrics across users, bookings, payments and complaints</Text>
      </div>

      {/* ===== Stat cards ===== */}
      <Row gutter={[16, 16]}>
        {statCards.map(card => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              border: '1px solid #f1f5f9',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{card.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {card.prefix}{card.value.toLocaleString()}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{card.sub}</Text>
                </div>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: card.color, background: card.bg
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ===== Trend chart (full width) ===== */}
      <Card
        style={{ marginTop: 16, borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}
        styles={{ body: { padding: '20px 24px' } }}
        title={<span style={{ fontWeight: 600 }}>Bookings & Revenue — Last 30 Days</span>}
        extra={<Tag icon={<RiseOutlined />} color="processing">Live</Tag>}
      >
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={stats?.bookingsTrend || []}>
            <defs>
              <linearGradient id="gBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Area yAxisId="l" type="monotone" dataKey="bookings" name="Bookings" stroke="#4F46E5" strokeWidth={2.5} fill="url(#gBookings)" />
            <Area yAxisId="r" type="monotone" dataKey="revenue" name="Revenue (Rs)" stroke="#10B981" strokeWidth={2.5} fill="url(#gRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ===== Three charts row ===== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}
            title={<span style={{ fontWeight: 600 }}>Users by Role</span>}
          >
            {stats?.usersByRole.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.usersByRole}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description="No users yet" />}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}
            title={<span style={{ fontWeight: 600 }}>Payment Methods</span>}
          >
            {stats?.paymentMethods.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.paymentMethods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" name="Transactions" fill="#06B6D4" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty description="No payments yet" />}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}
            title={<span style={{ fontWeight: 600 }}>Complaints by Status</span>}
          >
            {stats?.complaintsByStatus.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.complaintsByStatus}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.complaintsByStatus.map((entry, i) => (
                      <Cell key={i} fill={
                        entry.name.toLowerCase().includes('resol') ? '#10B981' :
                          entry.name.toLowerCase().includes('escalat') ? '#EF4444' : '#F59E0B'
                      } />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description="No complaints yet" />}
          </Card>
        </Col>
      </Row>

      {/* ===== Top grounds + booking status ===== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            style={{ borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}
            title={<span style={{ fontWeight: 600 }}>Top 5 Grounds by Bookings</span>}
          >
            {stats?.topGrounds.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.topGrounds}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.length > 10 ? `${v.slice(0, 10)}…` : v} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="bookings" name="Bookings" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="revenue" name="Revenue (Rs)" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty description="No bookings yet" />}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            style={{ borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}
            title={<span style={{ fontWeight: 600 }}>Booking Status Breakdown</span>}
          >
            {stats ? (
              <>
                <Row gutter={[8, 20]} style={{ marginTop: 12 }}>
                  {[
                    { label: 'Confirmed', value: stats.confirmedBookings, icon: <CheckCircleOutlined />, color: '#10B981' },
                    { label: 'Pending', value: stats.pendingBookings, icon: <ClockCircleOutlined />, color: '#F59E0B' },
                    { label: 'Cancelled', value: stats.cancelledBookings, icon: <CloseCircleOutlined />, color: '#EF4444' }
                  ].map(item => (
                    <Col xs={8} key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{item.icon} {item.label}</div>
                    </Col>
                  ))}
                </Row>
                <div style={{ marginTop: 20 }}>
                  {[
                    { label: 'Confirmed', value: stats.confirmedBookings, color: '#10B981' },
                    { label: 'Pending', value: stats.pendingBookings, color: '#F59E0B' },
                    { label: 'Cancelled', value: stats.cancelledBookings, color: '#EF4444' }
                  ].map(item => {
                    const pct = stats.totalBookings ? (item.value / stats.totalBookings) * 100 : 0;
                    return (
                      <div key={item.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                          <span>{item.label}</span><span>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : <Empty />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
