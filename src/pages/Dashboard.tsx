import { Building2, Users, GraduationCap, IndianRupee, Plus, FileQuestion, ClipboardList, Building, CreditCard, FileText, Clipboard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { PageHeader } from "@/components/ui/page-header";
import { mockDashboardStats, monthlyGrowthData, revenueByTierData, userDistributionData, recentActivities } from "@/data/mockData";
import { Link } from "react-router-dom";

const COLORS = ["hsl(175, 70%, 45%)", "hsl(24, 95%, 65%)", "hsl(0, 85%, 70%)"];
const USER_COLORS = ["hsl(0, 85%, 70%)", "hsl(24, 95%, 65%)", "hsl(175, 70%, 45%)", "hsl(270, 70%, 60%)"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "institute": return Building;
    case "user": return Users;
    case "payment": return CreditCard;
    case "content": return FileText;
    case "exam": return Clipboard;
    default: return Building;
  }
};

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with DonutAI."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Institutes"
          value={mockDashboardStats.totalInstitutes}
          change={mockDashboardStats.instituteGrowth}
          icon={Building2}
          className="animate-slide-up stagger-1"
        />
        <StatsCard
          title="Active Students"
          value={formatNumber(mockDashboardStats.activeStudents)}
          change={mockDashboardStats.studentGrowth}
          icon={GraduationCap}
          className="animate-slide-up stagger-2"
        />
        <StatsCard
          title="Active Teachers"
          value={formatNumber(mockDashboardStats.activeTeachers)}
          change={mockDashboardStats.teacherGrowth}
          icon={Users}
          className="animate-slide-up stagger-3"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(mockDashboardStats.monthlyRevenue)}
          change={mockDashboardStats.revenueGrowth}
          icon={IndianRupee}
          className="animate-slide-up stagger-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50 overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Institute Growth Trend</h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[400px] sm:min-w-0">
              <ResponsiveContainer width="100%" height={250} minWidth={350}>
                <AreaChart data={monthlyGrowthData}>
                  <defs>
                    <linearGradient id="colorInstitutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 85%, 70%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 85%, 70%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 25%, 88%)" />
                  <XAxis dataKey="name" stroke="hsl(20, 15%, 45%)" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="hsl(20, 15%, 45%)" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(30, 25%, 88%)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="institutes"
                    stroke="hsl(0, 85%, 70%)"
                    strokeWidth={2}
                    fill="url(#colorInstitutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Revenue by Tier - Donut Chart */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Revenue by Tier</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={revenueByTierData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {revenueByTierData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2">
            {revenueByTierData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs sm:text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* User Distribution */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50 overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold mb-4">User Distribution</h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[280px] sm:min-w-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={userDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 25%, 88%)" />
                  <XAxis type="number" stroke="hsl(20, 15%, 45%)" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="hsl(20, 15%, 45%)" fontSize={10} tick={{ fontSize: 10 }} width={60} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {userDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/superadmin/institutes/create">
              <Button className="w-full justify-start gap-3 h-11 sm:h-12 text-sm sm:text-base gradient-button">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add New Institute
              </Button>
            </Link>
            <Link to="/superadmin/questions/create">
              <Button variant="outline" className="w-full justify-start gap-3 h-11 sm:h-12 text-sm sm:text-base">
                <FileQuestion className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Question
              </Button>
            </Link>
            <Link to="/superadmin/exams/create">
              <Button variant="outline" className="w-full justify-start gap-3 h-11 sm:h-12 text-sm sm:text-base">
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Exam
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4">
            {recentActivities.slice(0, 4).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground truncate">{activity.message}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;