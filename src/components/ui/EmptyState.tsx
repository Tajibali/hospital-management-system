export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 text-sm text-slate-400">
      {message}
    </div>
  );
}
