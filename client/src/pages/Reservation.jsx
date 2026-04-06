import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiUsers, FiCheck, FiInfo } from "react-icons/fi";
import { GiRoundTable } from "react-icons/gi";
import toast from "react-hot-toast";
import api from "../api/api";
import { useStore } from "../store/useStore";

const SECTIONS = ["Indoor", "Outdoor", "Private", "Rooftop"];
const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Business Dinner",
  "Date Night",
  "Family Gathering",
  "Other",
];
const TIMES = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

// Mock seat map — 4 rows × 6 tables
const TABLES = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  seats: i % 4 === 0 ? 6 : i % 3 === 0 ? 4 : 2,
  section: SECTIONS[Math.floor(i / 6)].toLowerCase(),
}));

export default function Reservation() {
  const { user } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    date: "",
    time: "",
    guests: 2,
    section: "indoor",
    occasion: "",
    specialRequests: "",
    tableNumber: "",
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/reservations", {
        customerInfo: { name: form.name, email: form.email, phone: form.phone },
        date: form.date,
        time: form.time,
        guests: form.guests,
        section: form.section,
        occasion: form.occasion,
        specialRequests: form.specialRequests,
        tableNumber: selectedTable?.id?.toString() || form.tableNumber,
      });
      setSuccess(res.data);
      toast.success("Reservation confirmed! Check WhatsApp for details.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reservation failed");
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md card-dark p-10"
        >
          <div className="w-20 h-20 bg-gold/20 border-2 border-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-gold text-3xl" />
          </div>
          <h2 className="font-display text-3xl text-cream mb-2">
            Table Reserved!
          </h2>
          <p className="text-gold font-body font-semibold text-xl mb-4">
            {success.reservationNumber}
          </p>
          <div className="space-y-2 text-sm font-body text-cream/60 mb-8">
            <p>
              {new Date(form.date).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p>
              {form.time} · {form.guests} guests · {form.section}
            </p>
            {success.tableNumber && <p>Table #{success.tableNumber}</p>}
          </div>
          <p className="text-cream/40 text-xs font-body mb-6">
            A confirmation has been sent to your WhatsApp and email. We look
            forward to seeing you!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(null);
                setStep(1);
                setForm((p) => ({ ...p, date: "", time: "" }));
              }}
              className="btn-outline text-sm"
            >
              New Reservation
            </button>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="relative bg-dark-card border-b border-dark-border py-14 text-center mb-10">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=60"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-card to-dark-card" />
        </div>
        <div className="relative">
          <p className="section-subtitle mb-3">✦ Dine With Us ✦</p>
          <h1 className="section-title mb-3">Reserve a Table</h1>
          <p className="text-cream/50 font-body text-sm max-w-md mx-auto">
            Celebrate every moment with perfect ambiance, impeccable service,
            and extraordinary food.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {["Details", "Table", "Confirm"].map((label, i) => (
            <React.Fragment key={label}>
              <div
                className={`flex items-center gap-2 cursor-pointer`}
                onClick={() => i < step - 1 && setStep(i + 1)}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-bold transition-all ${step > i + 1 ? "bg-gold text-dark" : step === i + 1 ? "border-2 border-gold text-gold" : "border border-dark-border text-cream/30"}`}
                >
                  {step > i + 1 ? <FiCheck /> : i + 1}
                </div>
                <span
                  className={`text-sm font-body hidden sm:block ${step === i + 1 ? "text-gold" : "text-cream/30"}`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-px transition-all ${step > i + 1 ? "bg-gold" : "bg-dark-border"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card-dark p-6 space-y-5">
              <h2 className="font-display text-2xl text-cream">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="Full Name *"
                  className="input-dark"
                  required
                />
                <input
                  value={form.phone}
                  onChange={(e) => f("phone", e.target.value)}
                  placeholder="Phone Number *"
                  className="input-dark"
                  required
                />
                <input
                  value={form.email}
                  onChange={(e) => f("email", e.target.value)}
                  type="email"
                  placeholder="Email Address"
                  className="input-dark sm:col-span-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-cream/50 text-xs font-body mb-1.5 block flex items-center gap-1">
                    <FiCalendar className="text-gold" /> Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => f("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="input-dark w-full"
                    required
                  />
                </div>
                <div>
                  <label className="text-cream/50 text-xs font-body mb-1.5 block">
                    Time
                  </label>
                  <select
                    value={form.time}
                    onChange={(e) => f("time", e.target.value)}
                    className="input-dark w-full cursor-pointer"
                    required
                  >
                    <option value="">Select Time</option>
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-cream/50 text-xs font-body mb-1.5 block flex items-center gap-1">
                  <FiUsers className="text-gold" /> Number of Guests
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => f("guests", Math.max(1, form.guests - 1))}
                    className="w-10 h-10 rounded-full border border-dark-border text-cream/60 hover:border-gold hover:text-gold transition-all"
                  >
                    –
                  </button>
                  <span className="font-display text-3xl text-cream w-12 text-center">
                    {form.guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => f("guests", Math.min(20, form.guests + 1))}
                    className="w-10 h-10 rounded-full border border-dark-border text-cream/60 hover:border-gold hover:text-gold transition-all"
                  >
                    +
                  </button>
                  <span className="text-cream/40 text-sm font-body">
                    {form.guests === 1 ? "person" : "people"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-cream/50 text-xs font-body mb-2 block">
                  Dining Section
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SECTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => f("section", s.toLowerCase())}
                      className={`p-3 rounded-xl border text-sm font-body transition-all ${form.section === s.toLowerCase() ? "border-gold bg-gold/10 text-gold" : "border-dark-border text-cream/50 hover:border-gold/30"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-cream/50 text-xs font-body mb-2 block">
                  Occasion (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() =>
                        f("occasion", form.occasion === o ? "" : o)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.occasion === o ? "bg-gold/20 border-gold text-gold" : "border-dark-border text-cream/40 hover:border-gold/30"}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={form.specialRequests}
                onChange={(e) => f("specialRequests", e.target.value)}
                placeholder="Any special requests, dietary requirements, or surprises we should know about..."
                className="input-dark w-full min-h-[80px] resize-none"
              />

              <button
                type="button"
                onClick={() => {
                  if (!form.name || !form.phone || !form.date || !form.time)
                    return toast.error("Fill required fields");
                  setStep(2);
                }}
                className="btn-gold w-full justify-center py-3.5 text-base"
              >
                Choose Your Table
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Table selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card-dark p-6">
              <h2 className="font-display text-2xl text-cream mb-2">
                Choose Your Table
              </h2>
              <p className="text-cream/50 text-sm font-body mb-6 flex items-center gap-1">
                <FiInfo className="text-gold" /> Select a table in the{" "}
                {form.section} section
              </p>

              {/* Legend */}
              <div className="flex gap-4 mb-6 text-xs font-body">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 border border-gold/40 bg-gold/10 rounded" />
                  <span className="text-cream/50">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 border-2 border-gold bg-gold/30 rounded" />
                  <span className="text-cream/50">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 border border-dark-border bg-dark-border/60 rounded" />
                  <span className="text-cream/50">Unavailable</span>
                </div>
              </div>

              {/* Seat map */}
              <div className="bg-dark rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="inline-block bg-gold/10 border border-gold/30 text-gold text-xs font-body px-8 py-1.5 rounded-t-full">
                    ENTRANCE
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {TABLES.filter((t) => t.section === form.section).map(
                    (table) => (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() =>
                          setSelectedTable(
                            selectedTable?.id === table.id ? null : table,
                          )
                        }
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all text-[10px] font-body ${selectedTable?.id === table.id ? "border-gold bg-gold/20 text-gold" : "border-dark-border hover:border-gold/40 text-cream/40 hover:text-cream/60"}`}
                      >
                        <span className="font-bold text-xs">{table.id}</span>
                        <span>{table.seats}p</span>
                      </button>
                    ),
                  )}
                </div>
              </div>

              {selectedTable && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-gold font-body font-semibold">
                      Table #{selectedTable.id} selected
                    </p>
                    <p className="text-cream/50 text-xs">
                      Seats {selectedTable.seats} · {form.section} section
                    </p>
                  </div>
                  <FiCheck className="text-gold text-xl" />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1 justify-center py-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-gold flex-1 justify-center py-3"
                >
                  Review Booking
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card-dark p-6">
              <h2 className="font-display text-2xl text-cream mb-6">
                Confirm Reservation
              </h2>
              <div className="space-y-3 text-sm font-body mb-8">
                {[
                  ["Name", form.name],
                  ["Phone", form.phone],
                  ["Email", form.email || "Not provided"],
                  [
                    "Date",
                    form.date
                      ? new Date(form.date).toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "",
                  ],
                  ["Time", form.time],
                  ["Guests", `${form.guests} people`],
                  ["Section", form.section],
                  ...(form.occasion ? [["Occasion", form.occasion]] : []),
                  ...(selectedTable
                    ? [
                        [
                          "Table",
                          `#${selectedTable.id} (${selectedTable.seats} seats)`,
                        ],
                      ]
                    : []),
                  ...(form.specialRequests
                    ? [["Special Requests", form.specialRequests]]
                    : []),
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-dark-border pb-2"
                  >
                    <span className="text-cream/50">{label}</span>
                    <span className="text-cream text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6">
                <p className="text-gold text-xs font-body flex items-center gap-1.5">
                  <FiInfo /> A WhatsApp confirmation will be sent to{" "}
                  {form.phone}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1 justify-center py-3"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-gold flex-1 justify-center py-3 disabled:opacity-70"
                >
                  {loading ? "Booking..." : "Confirm Reservation"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
