"use client";
import { openAskKaty } from "./AskKaty";

export default function AskKatyButton({ query, label = "Спросить Katy", className = "btn-dark" }: { query?: string; label?: string; className?: string }) {
  return <button type="button" onClick={() => openAskKaty(query ?? "")} className={className}>{label}</button>;
}
