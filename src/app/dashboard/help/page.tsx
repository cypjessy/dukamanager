"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";

interface TutorialCategory {
  id: string;
  icon: string;
  label: { en: string; sw: string };
  labelShort: { en: string; sw: string };
  tutorials: { title: { en: string; sw: string }; content: { en: string; sw: string } }[];
}

const tutorialCategories: TutorialCategory[] = [
  {
    id: "dashboard",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    label: { en: "Dashboard", sw: "Dashibodi" },
    labelShort: { en: "Dashboard", sw: "Dashibodi" },
    tutorials: [
      { title: { en: "Viewing Dashboard Overview", sw: "Kuangalia Mapitio ya Dashibodi" }, content: { en: "The dashboard shows your daily sales, revenue, top products, and alerts. Check the health section for low stock and expiry warnings.", sw: "Dashibodi inaonyesha mauzo ya kila siku, mapato, bidhaa za juu, na tahadhari. Angalia sehemu ya afya kwa tahadhari za hesabu na muda wa kutumika." } },
      { title: { en: "Understanding Quick Actions", sw: "Kuelewa Vitendo vya Haraka" }, content: { en: "Quick actions let you create new sales, add products, record expenses, and add customers instantly from the dashboard.", sw: "Vitendo vya haraka vinakuwezesha kufanya mauzo mapya, kuongeza bidhaa, kurekodi matumizi, na kuongeza wateja haraka kutoka dashibodi." } },
    ],
  },
  {
    id: "inventory",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    label: { en: "Inventory / Products", sw: "Hesabu / Bidhaa" },
    labelShort: { en: "Inventory", sw: "Hesabu" },
    tutorials: [
      { title: { en: "Adding New Products", sw: "Kuongeza Bidhaa Mpya" }, content: { en: "Click the + button in the header to add a new product. Fill in name, SKU, category, prices, and stock quantity.", sw: "Bofya kitufe + kwenye kichwa kuongeza bidhaa mpya. Jaza jina, SKU, kategoria, bei, na kiasi cha hesabu." } },
      { title: { en: "Adjusting Stock Levels", sw: "Kurekodi Kiwango cha Hesabu" }, content: { en: "Use the + and - buttons in the inventory table to quickly adjust stock. Long press or click to enter exact quantities.", sw: "Tumia vitufe vya + na - kwenye Jedwali la hesabu kurekodi kiwango cha haraka. Bofya muda mrefu au bofya ili kuingiza viwango sahihi." } },
      { title: { en: "Printing Barcodes", sw: "Kuchapisha Barcode" }, content: { en: "Click the expand arrow on any product row to see actions. Click 'Print Barcode' to generate labels for your products.", sw: "Bofya shetani ya kupanua kwenye mlalo wa bidhaa kuona vitendo. Bofya 'Chapisha Barcode' kuzalisha lebu kwa bidhaa zako." } },
      { title: { en: "Setting Reorder Points", sw: "Kuweka Pointi za Kukagua" }, content: { en: "Edit a product to set reorder point. When stock falls below this level, you'll see low stock alerts on dashboard.", sw: "Hariri bidhaa kuweka pointi ya kukagua. Hesabu ikizidi chini ya kiwango hiki, utaona tahadhari za hesabu ya chini kwenye dashibodi." } },
    ],
  },
  {
    id: "sales",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    label: { en: "Sales", sw: "Mauzo" },
    labelShort: { en: "Sales", sw: "Mauzo" },
    tutorials: [
      { title: { en: "Recording a Sale", sw: "Kurekodi Mauzo" }, content: { en: "Go to POS, scan or search products, add to cart, select payment method, and complete sale. You can also use the Quick Sale feature.", sw: "Nenda kwenye POS, skani au tafuta bidhaa, ongeza kwenye kikapu, chagua njia ya malipo, na kamilisha mauzo. Pia unaweza kutumia kipengele cha Mauzo ya Haraka." } },
      { title: { en: "Handling M-Pesa Payments", sw: "Kushughulilia Malipo ya M-Pesa" }, content: { en: "Select M-Pesa as payment, enter the transaction code (M-Pesa message ID), and complete the sale. The receipt will be sent via SMS.", sw: "Chagua M-Pesa kama malipo, ingiza msimbo wa muamala (kitambulisho cha M-Pesa), na kamilisha mauzo. Risiti itatumwa kupitia SMS." } },
      { title: { en: "Creating Credit Sales", sw: "Kufanya Mauzo ya Kiingilio" }, content: { en: "Select 'Credit' as payment method, add customer details, and the amount will be tracked in accounts receivable.", sw: "Chagua 'Kiingilio' kama njia ya malipo, ongeza maelezo ya mteja, na kiwango kitafuatiliwa kwenye akaunti za mkopo." } },
    ],
  },
  {
    id: "refunds",
    icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
    label: { en: "Returns & Refunds", sw: "Marejesho" },
    labelShort: { en: "Refunds", sw: "Marejesho" },
    tutorials: [
      { title: { en: "Processing a Refund", sw: "Kushughulilia Marejesho" }, content: { en: "Click Return/Refund in the sidebar, select the transaction, choose items to return, and enter reason. In cashier portal, supervisor PIN is required.", sw: "Bofya Rejesha/Mrejesho kwenye upande, chagua muamala, chagua vitu vya kurejesha, na ingiza sababu. Kwenye kifagio, PIN ya msimamizi inahitajika." } },
      { title: { en: "Refund Without Receipt", sw: "Marejesho bila Risiti" }, content: { en: "Select 'No Receipt' option, manually enter product and amount, select refund method (cash or M-Pesa), and process.", sw: "Chagua chaguo 'Haina Risiti', ingiza bidhaa na kiwango kwa mkono, chagua njia ya marejesho (cash au M-Pesa), na shughulilia." } },
    ],
  },
  {
    id: "customers",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    label: { en: "Customers", sw: "Wateja" },
    labelShort: { en: "Customers", sw: "Wateja" },
    tutorials: [
      { title: { en: "Adding New Customers", sw: "Kuongeza Wateja Wapya" }, content: { en: "Go to Customers, click Add Customer, enter name, phone, email, and optional details. Loyalty points are automatic.", sw: "Nenda kwenye Wateja, bofya Ongeza Mteja, ingiza jina, simu, barua pepe, na maelezo ya hiari. Alama za uaminifu ni moja kwa moja." } },
      { title: { en: "Viewing Customer History", sw: "Kuangalia Historia ya Mteja" }, content: { en: "Click on any customer to see their purchase history, total spent, loyalty points, and outstanding balance.", sw: "Bofya kwenye mteja yoyote kuona historia ya ununuzi, jumla ya matumizi, alama za uaminifu, na deni lililobaki." } },
    ],
  },
  {
    id: "suppliers",
    icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
    label: { en: "Suppliers", sw: "Wazalishaji" },
    labelShort: { en: "Suppliers", sw: "Wazalishaji" },
    tutorials: [
      { title: { en: "Managing Supplier Directory", sw: "Kusimamia Orodha ya Wazalishaji" }, content: { en: "Add suppliers with contact details, payment terms, and categories. Track supplier performance and ratings.", sw: "Ongeza wazalishaji na maelezo ya mawasiliano, masharti ya malipo, na vikundi. Fuatilia utendaji wa wazalishaji na alama." } },
      { title: { en: "Creating Purchase Orders", sw: "Kufanya Orodha ya Ununuzi" }, content: { en: "Select supplier, add products, set transport cost, choose delivery date and payment terms. SMS notification is sent to supplier.", sw: "Chagua wazalishaji, ongeza bidhaa, weka gharama ya usafiri, chagua tarehe ya utoaji na masharti ya malipo. Taarifa ya SMS itatumwa kwenye wazalishaji." } },
    ],
  },
  {
    id: "expenses",
    icon: "M9 14l-6-6m2 5l2-2m2 2l2-2m2 2l2-2m2 2l2-2m-6 6h.01M9 20h.01M9.01 20h.01M9.01 19h.01M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z",
    label: { en: "Expenses", sw: "Matumizi" },
    labelShort: { en: "Expenses", sw: "Matumizi" },
    tutorials: [
      { title: { en: "Recording Expenses", sw: "Kurekodi Matumizi" }, content: { en: "Click Add Expense, select category, enter amount, date, description, and attach receipt photo if available.", sw: "Bofya Ongeza Matumizi, chagua kategoria, ingiza kiwango, tarehe, maelezo, na picha ya risiti ikiwa inapatikana." } },
      { title: { en: "Expense Categories", sw: "Vikundi vya Matumizi" }, content: { en: "Default categories include Rent, Utilities, Salaries, Transport, Marketing, and Supplies. Custom categories can be added in settings.", sw: "Vikundi chaguo-msingi ni Umeme, Maji, Mishahara, Usafiri, Masoko, na Vifaa. Vikundi maalum vinaweza kuongezwa kwenye mipangilio." } },
    ],
  },
  {
    id: "employees",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    label: { en: "Employees", sw: "Watumishi" },
    labelShort: { en: "Staff", sw: "Watumishi" },
    tutorials: [
      { title: { en: "Adding Staff Members", sw: "Kuongeza Waajiri" }, content: { en: "Go to Employees, click Add Employee, enter name, role, phone, and set login credentials. Assign permissions by role.", sw: "Nenda kwenye Watumishi, bofya Ongeza Mtumishi, ingiza jina, jukumu, simu, na weka kitambulisho cha kuingia. Weka ruhusa kulingana na jukumu." } },
      { title: { en: "Managing Permissions", sw: "Kusimamia Ruhusa" }, content: { en: "Roles include Admin, Manager, and Cashier with different permissions. Customize what each role can access and modify.", sw: "Majukumu ni Mkurugenzi, Meneja, na Mhasibu yenye ruhusa tofauti. Bobotesha kila jukumu kinachoweza kufikia na kuhariri." } },
    ],
  },
  {
    id: "cashier",
    icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
    label: { en: "Cashier Portal", sw: "Kifagio cha Mhasibu" },
    labelShort: { en: "Cashier", sw: "Mhasibu" },
    tutorials: [
      { title: { en: "Starting a Shift", sw: "Kuanza Mgawanyiko" }, content: { en: "Login to cashier portal, the shift starts automatically. Your name and shift duration show in the tools panel.", sw: "Ingia kwenye kifagio cha mhasibu, mgawanyiko unaanza moja kwa moja. Jina lako na muda wa mgawanyiko vinaonyeshwa kwenye paneli ya zana." } },
      { title: { en: "Processing Sales", sw: "Kushughulilia Mauzo" }, content: { en: "Search or scan products, add to cart, select payment method, and complete. Use held sales to pause and resume transactions.", sw: "Tafuta au skani bidhaa, ongeza kikapu, chagua njia ya malipo, na kamilisha. Tumia mauzo yaliyowekwa kusimama na kurejesha muamala." } },
      { title: { en: "Supervisor PIN Setup", sw: "Kuweka PIN ya Msimamizi" }, content: { en: "Owner/Manager can set a supervisor PIN in the cashier portal. This PIN is required for processing refunds in the cashier view.", sw: "Mmiliki/Meneja anaweza kuweka PIN ya msimamizi kwenye kifagio cha mhasibu. PIN hii inahitajika kwa kushughulilia marejesho kwenye mtazamo wa mhasibu." } },
    ],
  },
  {
    id: "pos",
    icon: "M9.75 17L9 20l-1 1h8l-1-1L9.75 17m-7.5 6h9l-1 1m-9-1h9l-1-1M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    label: { en: "Admin POS", sw: "POS ya Mmliki" },
    labelShort: { en: "Admin POS", sw: "POS ya Mmiliki" },
    tutorials: [
      { title: { en: "Using Admin POS", sw: "Kutumia POS ya Mmiliki" }, content: { en: "Admin POS works like Cashier Portal but with additional features. No supervisor PIN required for refunds.", sw: "POS ya Mmiliki inafanya kama Kifagio cha Mhasibu lakini na vipengele za ziada. Hakuna PIN ya msimamizi inahitajika kwa marejesho." } },
      { title: { en: "Barcode Scanning", sw: "Kuskania Barcode" }, content: { en: "Click the scan icon to enable camera scanning, or use a USB barcode scanner for faster input.", sw: "Bofya ikoni ya skani kuwasha camera ya kuskania, au tumia skani ya barcode ya USB kwa ingizo haraka zaidi." } },
    ],
  },
  {
    id: "reports",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    label: { en: "Reports & Analytics", sw: "Ripoti na Uchambuzi" },
    labelShort: { en: "Reports", sw: "Ripoti" },
    tutorials: [
      { title: { en: "Sales Reports", sw: "Ripoti za Mauzo" }, content: { en: "View daily, weekly, monthly sales. Filter by date range, payment method, product category, or cashier.", sw: "Angalia mauzo ya kila siku, wiki, mwezi. Chuja kulingana na safu ya tarehe, njia ya malipo, kategoria ya bidhaa, au mhasibu." } },
      { title: { en: "Profit & Loss Analysis", sw: "Uchambuzi wa Faida na Hasara" }, content: { en: "Reports show gross profit, expenses, and net profit. Compare periods to see business trends.", sw: "Ripoti zinaonyesha faida jeni, matumizi, na faida neti. Linganisha vipindi kuona mwelekeo wa biashara." } },
    ],
  },
  {
    id: "settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    label: { en: "Settings", sw: "Mipangilio" },
    labelShort: { en: "Settings", sw: "Mipangilio" },
    tutorials: [
      { title: { en: "Shop Configuration", sw: "Usanidi wa Duka" }, content: { en: "Update shop name, logo, address, contact info in Settings > Shop Info. Configure currency and receipt format.", sw: "Sasisha jina la duka, logi, anwani, maelezo ya mawasiliano kwenye Mipangilio > Info ya Duka. Sanidi sarafu na muundo wa risiti." } },
      { title: { en: "User Management", sw: "Usimamizi wa Watumiaji" }, content: { en: "Add, edit, or remove users. Set roles and permissions. Reset passwords from Settings > Users.", sw: "Ongeza, hariri, au ondoa watumiaji. Weka majukumu na ruhusa. Weka upya nywila kutoka Mipangilio > Watumiaji." } },
    ],
  },
];

export default function HelpPage() {
  const { locale } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState(tutorialCategories[0].id);
  const [openTutorial, setOpenTutorial] = useState<number | null>(null);

  const currentCategory = tutorialCategories.find((c) => c.id === selectedCategory)!;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
          {locale === "sw" ? "Msaada na Vidokezo" : "Help & Tutorials"}
        </h1>
        <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
          {locale === "sw" ? "Pata mafundisho kwa kila ukurasa wa programu" : "Get tutorials for every page in the app"}
        </p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tutorialCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setOpenTutorial(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 min-h-[44px] ${
              selectedCategory === cat.id
                ? "bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white shadow-md"
                : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={cat.icon} />
            </svg>
            <span className="hidden sm:inline">{locale === "sw" ? cat.label.sw : cat.label.en}</span>
            <span className="sm:hidden">{locale === "sw" ? cat.labelShort.sw : cat.labelShort.en}</span>
          </button>
        ))}
      </div>

      {/* Tutorials List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider">
              {locale === "sw" ? currentCategory.label.sw : currentCategory.label.en}
            </h2>
            {currentCategory.tutorials.map((tutorial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
              >
                <button
                  onClick={() => setOpenTutorial(openTutorial === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[56px]"
                >
                  <span className="text-sm font-semibold text-warm-900 dark:text-warm-50 pr-4">
                    {locale === "sw" ? tutorial.title.sw : tutorial.title.en}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-warm-400 flex-shrink-0 transition-transform ${openTutorial === i ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openTutorial === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4">
                        <p className="text-sm text-warm-600 dark:text-warm-300 leading-relaxed">
                          {locale === "sw" ? tutorial.content.sw : tutorial.content.en}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-2xl border border-terracotta-200/50 dark:border-terracotta-700/30 p-6"
        style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
      >
        <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-2">
          {locale === "sw" ? "Wasiliana Nasi" : "Contact Support"}
        </h3>
        <p className="text-sm text-warm-500 dark:text-warm-400 mb-4">
          {locale === "sw" ? "Tunapatikana kwa simu au WhatsApp kila siku" : "Available by phone or WhatsApp daily"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:+254748132692"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-500 text-white font-heading font-bold text-sm hover:bg-forest-600 transition-colors min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            0748 132 692
          </a>
          <a
            href="https://wa.me/254748132692"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-heading font-bold text-sm hover:bg-[#20BD5A] transition-colors min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </motion.div>

      {/* Version Info */}
      <p className="text-center text-xs text-warm-400 mt-6">
        DukaManager v1.0 • {new Date().getFullYear()}
      </p>
    </div>
  );
}