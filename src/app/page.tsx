import Link from "next/link";
import { UtensilsCrossed, QrCode, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-gray-900">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Ordena SaaS
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Plateforme SaaS Multi-Tenant de Commande & Service Restaurant
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/tables"
            className="p-5 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-gray-900 text-base group-hover:text-emerald-800">
                Gestion des Tables & QR
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Générez, téléchargez et imprimez les QR codes uniques pour chaque table.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <span>Accéder à /admin/tables</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/staff/floor-map"
            className="p-5 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-gray-900 text-base group-hover:text-emerald-800">
                Plan de Salle (Staff)
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Supervisez l&apos;état des tables, les appels serveur et les additions en temps réel (polling 4s).
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <span>Accéder à /staff/floor-map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Authentification NextAuth v5 active avec isolation multi-tenant automatique.
          </span>
        </div>
      </div>
    </div>
  );
}
