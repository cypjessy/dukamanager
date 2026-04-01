import type { Metadata } from "next";
import Link from "next/link";
import { parseVerificationCode, generateBrandGradient, getShopInitials } from "@/lib/shopTenant";

interface VerifyPageProps {
  params: { code: string };
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const code = params.code;
  return {
    title: `Verify Receipt ${code} — DukaManager`,
    description: "Verify your DukaManager sales receipt",
  };
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const rawCode = params.code?.replace(/-/g, "").toUpperCase();
  const parsed = parseVerificationCode(params.code || "");

  // In production, this would look up verification in database by code
  // and fetch the associated shop tenant for branding isolation
  const isValid = rawCode && rawCode.length >= 8 && parsed !== null;

  // Demo: derive shop info from code prefix
  const shopPrefix = parsed?.prefix || "";
  const demoShopName = shopPrefix === "MNJ" ? "Mama Njeri Groceries" :
                       shopPrefix === "WES" ? "Westlands Branch" :
                       "DukaManager Partner Shop";
  const demoShopLocation = shopPrefix === "MNJ" ? "Gikomba, Nairobi" : "Nairobi";
  const demoKraPin = "A123456789B";

  // Generate brand gradient from shop name
  const [gradFrom, gradTo] = generateBrandGradient(demoShopName);
  const initials = getShopInitials(demoShopName);

  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-savanna-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {isValid ? (
            <>
              {/* Verified header with shop branding */}
              <div className="px-6 py-8 text-center text-white"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h1 className="font-heading font-extrabold text-xl mb-1">Receipt Verified</h1>
                <p className="text-white/80 text-sm">Risiti Imethibitishwa</p>
              </div>

              {/* Receipt details with shop branding */}
              <div className="px-6 py-6">
                {/* Shop info */}
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-md"
                    style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
                    {initials}
                  </div>
                  <p className="font-heading font-bold text-warm-900">{demoShopName}</p>
                  <p className="text-sm text-warm-500">{demoShopLocation}</p>
                  <p className="text-xs text-warm-400">KRA PIN: {demoKraPin}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warm-400">Verification Code</span>
                    <span className="font-mono font-bold tracking-wider" style={{ color: gradFrom }}>{rawCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">Status</span>
                    <span className="text-forest-600 font-medium flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      Valid
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">Sender</span>
                    <span className="font-mono text-warm-700">{demoShopName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11)}</span>
                  </div>
                  <div className="border-t border-warm-100 pt-3">
                    <p className="text-warm-500 text-xs mb-1">This receipt has been verified as authentic.</p>
                    <p className="text-warm-400 text-xs">Risiti hii imethibitishwa kuwa halali.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-warm-50 p-4 text-center">
                  <p className="text-xs text-warm-500 mb-2">Verified via</p>
                  <p className="text-sm font-mono text-warm-700">duka.manager/v/{rawCode}</p>
                </div>

                {/* Powered by */}
                <p className="text-center text-[10px] text-warm-300 mt-4">Powered by DukaManager Platform</p>
              </div>
            </>
          ) : (
            <>
              {/* Invalid header */}
              <div className="bg-red-500 px-6 py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h1 className="text-white font-heading font-extrabold text-xl mb-1">Receipt Not Found</h1>
                <p className="text-white/80 text-sm">Risiti Haikupatikana</p>
              </div>

              <div className="px-6 py-6 text-center">
                <p className="text-sm text-warm-500 mb-4">
                  The verification code you entered is invalid or has expired. Please check the code and try again.
                </p>
                <p className="text-xs text-warm-400 mb-6">
                  Nambari ya uthibitisho uliyoweka si sahihi au imeisha muda. Tafuta nambari na jaribu tena.
                </p>
                <div className="rounded-xl bg-warm-50 p-4">
                  <p className="text-xs text-warm-500 mb-2">Need help?</p>
                  <a href="tel:+254700000000" className="text-sm text-terracotta-600 font-medium">Contact Support</a>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="border-t border-warm-100 px-6 py-4 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-terracotta-600 font-medium hover:text-terracotta-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              DukaManager
            </Link>
            <p className="text-xs text-warm-400 mt-1">Run Your Duka Like a Pro</p>
          </div>
        </div>
      </div>
    </main>
  );
}
