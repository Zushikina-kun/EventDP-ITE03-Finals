/**
 * Animated skeleton row for the students table.
 * Renders `count` placeholder rows while data is loading.
 */
export default function SkeletonRow({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-3 bg-slate-800 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-800 rounded w-36" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-3 bg-slate-800 rounded w-44" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-slate-800 rounded w-16" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-slate-800 rounded w-12" /></td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <div className="h-3 bg-slate-800 rounded w-8" />
          <div className="h-3 bg-slate-800 rounded w-12" />
        </div>
      </td>
    </tr>
  ));
}
