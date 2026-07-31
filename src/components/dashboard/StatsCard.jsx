export default function StatsCard({ title, value, icon, bgAccent }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bgAccent}`}>
        {icon}
      </div>
    </div>
  );
}