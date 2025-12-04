import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LinkMethod from "../components/LinkMethod";
import { Link } from "react-router-dom";

// small utility for sparkline (SVG path)
function sparklinePath(values, width = 120, height = 36) {
  if (!values || values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function StatCard({ title, value, spark = null, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    green: "bg-green-50 border-green-200 text-green-700",
    pink: "bg-pink-50 border-pink-200 text-pink-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  return (
    <div
      className={`flex-1 min-w-[160px] p-5 rounded-xl shadow-md border ${colorClasses[color]}`}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-2xl font-extrabold mt-2">{value}</div>
      {spark && (
        <svg width="120" height="36" className="mt-3">
          <path
            d={spark}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  // demo stats & activity — replace with real API calls later
  const stats = {
    totalDonations: "₹ 12,450",
    donors: 124,
    successRate: "98%",
  };
  const donationsSeries = [1200, 900, 1500, 1300, 2000, 1000, 1450];
  const recentActivity = [
    { id: 1, type: "Login", detail: user?.email || user?.phone, time: "2m ago" },
    { id: 2, type: "Donation", detail: "₹500 by +91xxxx", time: "1h ago" },
    { id: 3, type: "Email verify", detail: user?.email ? `Verified ${user.email}` : "-", time: "2d ago" },
  ];

  return (
    <div className="px-5 max-w-6xl mx-auto my-6 bg-gray-50 min-h-screen rounded-lg">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-700">Dashboard</h1>
          <div className="text-gray-600 mt-1 font-medium">
            Welcome back {user?.email || user?.phone}
          </div>
        </div>

        {/* Donate button navigates to /donate */}
        <Link
          to="/donate"
          className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition duration-200"
        >
          💖 Donate
        </Link>

        <div className="text-right bg-indigo-100 px-4 py-2 rounded-lg shadow-sm">
          <div className="text-xs text-gray-600">Plan</div>
          <div className="font-bold text-indigo-700">Free</div>
        </div>
      </header>

      {/* Stats */}
      <section className="flex gap-4 mb-8">
        <StatCard
          title="Total donations"
          value={stats.totalDonations}
          spark={sparklinePath(donationsSeries)}
          color="indigo"
        />
        <StatCard
          title="Donors"
          value={stats.donors}
          spark={sparklinePath([10, 20, 15, 30, 25, 22, 24])}
          color="green"
        />
        <StatCard
          title="Success rate"
          value={stats.successRate}
          spark={sparklinePath([95, 96, 97, 98, 98, 97, 98])}
          color="pink"
        />
      </section>

      {/* Activity + Sidebar */}
      <section className="grid grid-cols-[1fr_380px] gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-indigo-700 mb-4">Recent activity</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Details</th>
                <th className="py-2 px-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-2 px-2 font-semibold text-gray-700">{r.type}</td>
                  <td className="py-2 px-2 text-gray-800">{r.detail}</td>
                  <td className="py-2 px-2 text-gray-500">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          {/* Profile */}
          <div className="bg-yellow-50 p-5 rounded-xl shadow-md border border-yellow-200">
            <h4 className="font-bold text-yellow-700 mb-2">Profile</h4>
            <div className="text-gray-700 space-y-1 font-medium">
              <div><strong>ID:</strong> {user?._id}</div>
              <div><strong>Email:</strong> {user?.email || "—"}</div>
              <div><strong>Phone:</strong> {user?.phone || "—"}</div>
              <div><strong>Methods:</strong> {(user?.authMethods || []).join(", ")}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-green-50 p-5 rounded-xl shadow-md border border-green-200">
            <h4 className="font-bold text-green-700 mb-2">Quick actions</h4>
            <div className="flex flex-col gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <LinkMethod />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}