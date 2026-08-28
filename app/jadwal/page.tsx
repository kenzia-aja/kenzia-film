import type { Metadata } from "next";
import { getSchedule } from "@/lib/api";
import ScheduleTabs, { type ScheduleDay } from "@/components/schedule-tabs";

export const metadata: Metadata = {
  title: "Jadwal Rilis",
  description: "Jadwal rilis episode drama mingguan.",
};

export const revalidate = 3600;

async function loadSchedule(): Promise<ScheduleDay[]> {
  try {
    return await getSchedule();
  } catch {
    return [];
  }
}

export default async function JadwalPage() {
  const days = await loadSchedule();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-24">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.35em] text-brand">
        Mingguan
      </p>
      <h1 className="font-display text-5xl uppercase tracking-wide">Jadwal Rilis</h1>
      <p className="mb-8 mt-2 text-sm text-zinc-500">
        Estimasi jadwal update episode setiap hari — berdasarkan rilis minggu
        sebelumnya, bisa lebih cepat atau lambat.
      </p>

      {days.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
          Tidak bisa memuat jadwal. Pastikan API berjalan di port 8000.
        </p>
      ) : (
        <ScheduleTabs days={days} />
      )}
    </div>
  );
}
