'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PersonaCard from "@/components/PersonaCard";
import PersonaSkeleton from "@/components/PersonaSkeleton";
import type { Persona } from "@/types";

// Some sample companies with traits for quick selection
const sampleCompanies = [
  {
    name: "EcoGreen Solutions",
    traits: "sustainable products, eco-friendly packaging, carbon-neutral operations, plant-based alternatives"
  },
  {
    name: "TechNova",
    traits: "AI software, machine learning, cloud computing, enterprise solutions, data analytics"
  },
  {
    name: "UrbanFit",
    traits: "fitness apparel, athleisure wear, sustainable materials, performance fabrics, inclusive sizing"
  },
  {
    name: "GourmetBox",
    traits: "meal subscription service, organic ingredients, international cuisine, dietary accommodations, chef-designed recipes"
  }
];

export default function HomePage() {
  const [companyName, setCompanyName] = useState("");
  const [traits, setTraits] = useState("");
  const [model, setModel] = useState("fireworks");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load previously generated personas from localStorage on initial render
  useEffect(() => {
    const storedPersonas = localStorage.getItem("personas");
    if (storedPersonas) {
      try {
        const parsedPersonas = JSON.parse(storedPersonas);
        if (Array.isArray(parsedPersonas) && parsedPersonas.length > 0) {
          setPersonas(parsedPersonas);
        }
      } catch (err) {
        console.error("Failed to parse stored personas:", err);
      }
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, characteristics: traits, model }),
      });

      const data = await res.json();
      if (!res.ok || !data.personas) {
        throw new Error(data.error || "Invalid response from server");
      }

      setPersonas(data.personas);
      localStorage.setItem("personas", JSON.stringify(data.personas));
    } catch (err) {
      console.error("Client error:", err);
      alert("Failed to load personas. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Apply a sample company and its traits
  const applySampleCompany = (company: typeof sampleCompanies[0]) => {
    setCompanyName(company.name);
    setTraits(company.traits);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Customer Persona Generator
        </h1>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center">Choose a Sample Company</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleCompanies.map((company, idx) => (
              <button
                key={idx}
                onClick={() => applySampleCompany(company)}
                className="text-left p-4 border rounded-lg hover:bg-gray-50 transition shadow-sm hover:shadow-md"
              >
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-600 truncate">{company.traits}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4 text-center">or Generate Your Own</h2>
          <input
            className="mb-3 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <textarea
            className="mb-3 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
            placeholder="Company traits (comma-separated)"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            rows={3}
          />
          <select
            className="mb-4 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="fireworks">Fireworks (LLaMA v3 8B)</option>
          </select>

          <button
            onClick={generate}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!companyName.trim() || !traits.trim() || loading}
          >
            {loading ? "Generating..." : "Generate Personas"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {loading && personas.length === 0 ? (
            <>
              <PersonaSkeleton />
              <PersonaSkeleton />
              <PersonaSkeleton />
            </>
          ) : loading ? (
            <div className="col-span-3 text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Generating new personas...</p>
            </div>
          ) : (
            personas.map((p, idx) => (
              <PersonaCard key={idx} persona={p} index={idx} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
