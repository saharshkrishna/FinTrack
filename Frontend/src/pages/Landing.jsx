import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowRight,
  ShieldCheck, 
  Layers, 
  BarChart3, 
  PieChart, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  ArrowUp, 
  ArrowDown, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { transactions } = useContext(DataContext);
  const { user, activeBusiness, logout } = useContext(AuthContext);

  const isLoggedIn = !!user || !!localStorage.getItem('token');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Minimalist Fintech Navbar
  const Navbar = () => (
    <header className="sticky top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Brand */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-95">
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-950">
            FinTrack
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            v2.0
          </span>
        </div>

        {/* Navigation links (Desktop) */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('security')} 
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Security
            </button>
          </nav>
        )}

        {/* Auth CTAs */}
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-950 font-medium transition-colors cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/expense-book')}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <span>Go to Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-slate-500 hover:text-rose-600 transition-colors cursor-pointer font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );

  // Unauthenticated Landing View
  const LandingPage = () => (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-6 border-b border-slate-200/70 bg-gradient-to-b from-white to-[#fafafa]">
        <div className="max-w-5xl mx-auto text-center">
          {/* Subtle Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-600 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="font-medium text-slate-800">Precision Financial Clarity</span>
            <span className="text-slate-400">•</span>
            <span>Minimalist Ledger Architecture</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.12] mb-6">
            Take Control of Your Money. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
              Understand Every Move.
            </span>
          </h1>

          {/* Supporting description */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Track expenses, monitor income, understand spending patterns, and make smarter financial decisions — all from one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-base transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-medium text-base transition-all shadow-2xs hover:border-slate-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Live Product Preview Mockup */}
          <div className="relative max-w-5xl mx-auto rounded-2xl p-2 bg-slate-200/50 border border-slate-300/80 shadow-2xl shadow-slate-300/40">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left shadow-xs">
              {/* Mockup Window Chrome */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">fintrack.app/workspace/ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Live Demo Preview
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Body */}
              <div className="p-6 md:p-8 bg-white">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="text-xs font-medium text-slate-500 mb-1">Total Net Liquidity</div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">₹1,84,500</div>
                    <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+14.2% this month</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs font-medium text-slate-500 mb-1">Cash Inflow</div>
                    <div className="text-2xl font-bold text-emerald-600 tracking-tight">₹62,400</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">Direct receipts & transfers</div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs font-medium text-slate-500 mb-1">Operating Outflow</div>
                    <div className="text-2xl font-bold text-rose-600 tracking-tight">₹21,800</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">18 verified entries</div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                    <div className="text-xs font-medium text-blue-900 mb-1">Ledger Health Score</div>
                    <div className="text-2xl font-bold text-blue-700 tracking-tight">94 / 100</div>
                    <div className="text-[11px] font-medium text-blue-600 mt-1">Optimal runway reserve</div>
                  </div>
                </div>

                {/* Ledger Mock Rows */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2 border-b border-slate-200">
                    <span className="col-span-3">Date</span>
                    <span className="col-span-2">Type</span>
                    <span className="col-span-3">Party / Category</span>
                    <span className="col-span-2">Mode</span>
                    <span className="col-span-2 text-right">Amount</span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {[
                      { date: '2026-11-08', type: 'Cash In', party: 'Enterprise Retainer', cat: 'Consulting', mode: 'Bank Wire', amount: '+₹45,000', green: true },
                      { date: '2026-11-07', type: 'Cash Out', party: 'AWS Cloud Services', cat: 'Infrastructure', mode: 'Credit Card', amount: '-₹3,420', green: false },
                      { date: '2026-11-06', type: 'Cash In', party: 'Product Licensing', cat: 'Subscriptions', mode: 'UPI', amount: '+₹17,400', green: true },
                      { date: '2026-11-05', type: 'Cash Out', party: 'Co-working Office Rent', cat: 'Operations', mode: 'Bank Transfer', amount: '-₹18,000', green: false }
                    ].map((row, idx) => (
                      <div key={idx} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 transition-colors">
                        <span className="col-span-3 font-mono text-slate-600">{row.date}</span>
                        <span className="col-span-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.green ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}>
                            {row.type}
                          </span>
                        </span>
                        <div className="col-span-3 truncate">
                          <span className="font-medium text-slate-800">{row.party}</span>
                          <span className="text-slate-400 text-[11px] block">{row.cat}</span>
                        </div>
                        <span className="col-span-2 text-slate-600 font-mono text-[11px]">{row.mode}</span>
                        <span className={`col-span-2 text-right font-mono font-semibold ${row.green ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {row.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
            Core Capabilities
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-4">
            Engineered for Financial Clarity
          </h3>
          <p className="text-slate-600 text-base">
            Everything you need to track multi-channel cashflows, manage counterparty balances, and make informed business decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <DollarSign className="w-5 h-5 text-blue-600" />,
              title: "Income & Expense Tracking",
              description: "Record multi-mode transactions (UPI, Bank, Cash) with real-time balance calculations and receipt attachments."
            },
            {
              icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
              title: "Real-time Financial Overview",
              description: "Instant metrics on operating margins, net cash position, and automated financial health scoring."
            },
            {
              icon: <Layers className="w-5 h-5 text-blue-600" />,
              title: "Transaction Management",
              description: "High-density ledger view with fuzzy search, date duration filtering, and multi-row batch actions."
            },
            {
              icon: <PieChart className="w-5 h-5 text-blue-600" />,
              title: "Spending Analytics",
              description: "Visual breakdown of cash outflows across categories and payment channels to identify leakages immediately."
            },
            {
              icon: <Clock className="w-5 h-5 text-blue-600" />,
              title: "Loan & Debt Tracking",
              description: "Monitor loan disbursements, principal balances, and repayments linked directly to counterparty accounts."
            },
            {
              icon: <FileText className="w-5 h-5 text-blue-600" />,
              title: "Financial Reports & Insights",
              description: "Export high-resolution executive PDF reports with statistical charts and color-coded transaction audits."
            }
          ].map((feat, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                {feat.title}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
              Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-4">
              Three Simple Steps to Complete Control
            </h3>
            <p className="text-slate-600 text-base">
              A frictionless process built for individuals, freelancers, and businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Record",
                desc: "Add your income, expenses, and loans with category tags, party names, and receipt vouchers in seconds."
              },
              {
                step: "02",
                title: "Analyze",
                desc: "Understand exactly where your money flows with automated charts, category splits, and payment mode distributions."
              },
              {
                step: "03",
                title: "Improve",
                desc: "Make confident financial decisions backed by actionable cash runway metrics and net margin indicators."
              }
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-xl bg-[#fafafa] border border-slate-200">
                <div className="text-xs font-mono font-bold text-blue-600 mb-3">
                  STEP {s.step}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Assurance Section */}
      <section id="security" className="py-16 px-6 max-w-5xl mx-auto">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Enterprise Security & Strict Isolation</h4>
              <p className="text-sm text-slate-600">Your financial records are strictly isolated by business ledger identifiers with industry-standard encryption.</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Token Auth</span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Know your money. Control your spending. Build better financial habits.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-8">
            Experience the clarity of a modern fintech platform. Start organizing your personal or business ledger today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-base transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl font-medium text-base transition-colors cursor-pointer"
            >
              Sign in to Existing Ledger
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-slate-200 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-950 flex items-center justify-center text-white text-[10px] font-bold">
              F
            </div>
            <span className="font-semibold text-slate-900">FinTrack</span>
            <span className="text-slate-400">© 2026 FinTrack Platform. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600">
            <span>Financial Precision</span>
            <span>Ledger Integrity</span>
            <span>Export Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );

  // Authenticated Overview Dashboard
  const Dashboard = () => {
    const currency = activeBusiness?.currency || '₹';

    const totalExpenses = (transactions || []).reduce((sum, t) => {
      const typeLower = (t.type || '').toLowerCase().replace(/\s+/g, '');
      return typeLower === 'cashout' ? sum + (Number(t.amount) || 0) : sum;
    }, 0);

    const totalIncome = (transactions || []).reduce((sum, t) => {
      const typeLower = (t.type || '').toLowerCase().replace(/\s+/g, '');
      return typeLower === 'cashin' ? sum + (Number(t.amount) || 0) : sum;
    }, 0);

    const netBalance = totalIncome - totalExpenses;
    const transactionCount = (transactions || []).length;

    return (
      <div className="min-h-screen bg-[#fafafa] text-slate-900">
        <Navbar />
        
        <main className="max-w-7xl mx-auto pt-10 pb-16 px-6">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  {activeBusiness?.name || 'Main Ledger'}
                </h1>
                {activeBusiness?.businessId && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {activeBusiness.businessId}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Connected ledger overview and net liquidity metrics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/expense-book')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Open Expense Book</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/financial-overview')}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>Full Analytics</span>
              </button>
            </div>
          </div>

          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">Total Inflow</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-2xl font-bold text-slate-950 font-mono tracking-tight">
                {currency}{totalIncome.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
                <ArrowUp className="w-3 h-3" />
                <span>Recorded Cash In entries</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">Total Outflow</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="text-2xl font-bold text-slate-950 font-mono tracking-tight">
                {currency}{totalExpenses.toLocaleString()}
              </div>
              <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5">
                <ArrowDown className="w-3 h-3" />
                <span>Recorded Cash Out entries</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">Net Position</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className={`text-2xl font-bold font-mono tracking-tight ${
                netBalance >= 0 ? 'text-slate-950' : 'text-rose-600'
              }`}>
                {currency}{netBalance.toLocaleString()}
              </div>
              <div className={`text-[11px] font-medium flex items-center gap-1 mt-1.5 ${
                netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {netBalance >= 0 ? 'Operating surplus' : 'Operating deficit'}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">Audited Transactions</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-950 font-mono tracking-tight">
                {transactionCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1.5">
                Total journal ledger records
              </div>
            </div>
          </div>

          {/* Quick Ledger Action Card */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950 mb-1">
                Manage Ledger Records & Statements
              </h3>
              <p className="text-sm text-slate-500">
                You currently have {transactionCount} entries in {activeBusiness?.name || 'this ledger'}. Add entries, generate high-res PDF statements, or import spreadsheets.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/expense-book')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <span>Go to Expense Book</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <>
      {isLoggedIn ? <Dashboard /> : <LandingPage />}
    </>
  );
}
