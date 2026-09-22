import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  RotateCcw,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import type { ShipmentStatus } from '../types';

interface StateStep {
  status: ShipmentStatus;
  persianTitle: string;
  englishTitle: string;
  role: 'Customer' | 'Courier' | 'Operations';
  description: string;
  nextStatuses: ShipmentStatus[];
  category: 'origin' | 'transit' | 'terminal' | 'return';
  gradient: string;
  shadowColor: string;
  borderGlow: string;
  iconColor: string;
  icon: typeof Package;
}

const LIFECYCLE_STEPS: StateStep[] = [
  {
    status: 'Created',
    persianTitle: 'ثبت سفارش اولیه',
    englishTitle: 'Created',
    role: 'Customer',
    description: 'سفارش ثبت شده و شناسه یکتای رهگیری صادر گردیده است.',
    nextStatuses: ['AwaitingPickup', 'Cancelled'],
    category: 'origin',
    gradient: 'from-blue-500 via-indigo-500 to-blue-700',
    shadowColor: 'rgba(59, 130, 246, 0.45)',
    borderGlow: 'rgba(147, 197, 253, 0.6)',
    iconColor: '#ffffff',
    icon: Package,
  },
  {
    status: 'AwaitingPickup',
    persianTitle: 'در انتظار تحویل به باجه',
    englishTitle: 'Awaiting Pickup',
    role: 'Customer',
    description: 'بسته آماده ارسال بوده و در باجه یا نزد فرستنده منتظر پذیرش است.',
    nextStatuses: ['Accepted', 'Cancelled'],
    category: 'origin',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    shadowColor: 'rgba(245, 158, 11, 0.45)',
    borderGlow: 'rgba(253, 230, 138, 0.6)',
    iconColor: '#ffffff',
    icon: Clock3,
  },
  {
    status: 'Cancelled',
    persianTitle: 'سفارش لغو شده',
    englishTitle: 'Cancelled',
    role: 'Customer',
    description: 'سفارش قبل از پذیرش باجه، بنا به درخواست فرستنده منسوخ شد.',
    nextStatuses: [],
    category: 'terminal',
    gradient: 'from-rose-500 via-red-600 to-red-800',
    shadowColor: 'rgba(239, 68, 68, 0.45)',
    borderGlow: 'rgba(254, 202, 202, 0.6)',
    iconColor: '#ffffff',
    icon: Ban,
  },
  {
    status: 'Accepted',
    persianTitle: 'پذیرش رسمی در مبدأ',
    englishTitle: 'Accepted at Hub',
    role: 'Operations',
    description: 'بارکد مرسوله اسکن شده و وارد شبکه سراسری پست شد.',
    nextStatuses: ['InTransit', 'ReturnInitiated'],
    category: 'transit',
    gradient: 'from-sky-400 via-blue-600 to-indigo-700',
    shadowColor: 'rgba(2, 132, 199, 0.45)',
    borderGlow: 'rgba(186, 230, 253, 0.6)',
    iconColor: '#ffffff',
    icon: PackageCheck,
  },
  {
    status: 'InTransit',
    persianTitle: 'انتقال بین‌شهری',
    englishTitle: 'In Transit',
    role: 'Operations',
    description: 'مرسوله سوار بر ناوگان خطوط ترانزیت در مسیر شهر مقصد است.',
    nextStatuses: ['OutForDelivery', 'ReturnInitiated'],
    category: 'transit',
    gradient: 'from-blue-600 via-cyan-600 to-teal-700',
    shadowColor: 'rgba(37, 99, 235, 0.45)',
    borderGlow: 'rgba(191, 219, 254, 0.6)',
    iconColor: '#ffffff',
    icon: Route,
  },
  {
    status: 'OutForDelivery',
    persianTitle: 'در دست مأمور توزیع',
    englishTitle: 'Out for Delivery',
    role: 'Courier',
    description: 'پیک توزیع مرسوله را تحویل گرفته و در مسیر درب منزل گیرنده است.',
    nextStatuses: ['Delivered', 'DeliveryFailed'],
    category: 'transit',
    gradient: 'from-orange-500 via-amber-500 to-orange-700',
    shadowColor: 'rgba(234, 88, 12, 0.45)',
    borderGlow: 'rgba(254, 215, 170, 0.6)',
    iconColor: '#ffffff',
    icon: Truck,
  },
  {
    status: 'Delivered',
    persianTitle: 'تحویل موفق به گیرنده',
    englishTitle: 'Delivered',
    role: 'Courier',
    description: 'مرسوله با ثبت مشخصات تحویل‌گیرنده درب مقصد با موفقیت تحویل شد.',
    nextStatuses: [],
    category: 'terminal',
    gradient: 'from-emerald-400 via-green-500 to-emerald-700',
    shadowColor: 'rgba(16, 185, 129, 0.45)',
    borderGlow: 'rgba(167, 243, 208, 0.6)',
    iconColor: '#ffffff',
    icon: CheckCircle2,
  },
  {
    status: 'DeliveryFailed',
    persianTitle: 'عدم توزیع و تلاش ناموفق',
    englishTitle: 'Delivery Failed',
    role: 'Courier',
    description: 'گیرنده حضور نداشت یا آدرس نامشخص بود (آماده نوبت توزیع مجدد).',
    nextStatuses: ['OutForDelivery', 'ReturnInitiated'],
    category: 'return',
    gradient: 'from-amber-500 via-rose-500 to-red-700',
    shadowColor: 'rgba(225, 29, 72, 0.45)',
    borderGlow: 'rgba(254, 205, 211, 0.6)',
    iconColor: '#ffffff',
    icon: AlertTriangle,
  },
  {
    status: 'ReturnInitiated',
    persianTitle: 'دستور برگشت به فرستنده',
    englishTitle: 'Return Initiated',
    role: 'Operations',
    description: 'مدیر سامانه حکم مرجوعی بسته به آدرس اولیه فرستنده را صادر کرد.',
    nextStatuses: ['ReturningToSender'],
    category: 'return',
    gradient: 'from-purple-500 via-indigo-600 to-indigo-800',
    shadowColor: 'rgba(99, 102, 241, 0.45)',
    borderGlow: 'rgba(224, 231, 255, 0.6)',
    iconColor: '#ffffff',
    icon: RotateCcw,
  },
  {
    status: 'ReturningToSender',
    persianTitle: 'در حال بازگشت به مبدأ',
    englishTitle: 'Returning to Sender',
    role: 'Operations',
    description: 'بسته در خط برگشتی به سمت هاب و مرکز پستی فرستنده حرکت می‌کند.',
    nextStatuses: ['ReturnedToSender'],
    category: 'return',
    gradient: 'from-indigo-600 via-purple-700 to-fuchsia-800',
    shadowColor: 'rgba(139, 92, 246, 0.45)',
    borderGlow: 'rgba(233, 213, 255, 0.6)',
    iconColor: '#ffffff',
    icon: Route,
  },
  {
    status: 'ReturnedToSender',
    persianTitle: 'مرجوعی قطعی به فرستنده',
    englishTitle: 'Returned to Sender',
    role: 'Operations',
    description: 'مرسوله به آدرس مبدأ اسنپ‌شات تحویل شد و سفر آن خاتمه یافت.',
    nextStatuses: [],
    category: 'terminal',
    gradient: 'from-slate-600 via-zinc-700 to-zinc-900',
    shadowColor: 'rgba(71, 85, 105, 0.45)',
    borderGlow: 'rgba(226, 232, 240, 0.6)',
    iconColor: '#ffffff',
    icon: PackageCheck,
  },
];

export function LifecycleExplorer() {
  const [activeStatus, setActiveStatus] = useState<ShipmentStatus>('InTransit');
  const [hoveredStatus, setHoveredStatus] = useState<ShipmentStatus | null>(null);

  const currentStatus = hoveredStatus ?? activeStatus;
  const currentStep = LIFECYCLE_STEPS.find((s) => s.status === currentStatus) ?? LIFECYCLE_STEPS[4];

  return (
    <section className="relative overflow-hidden rounded-card border border-line/80 bg-gradient-to-b from-surface via-subtle/40 to-surface p-6 sm:p-10 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8 pb-6 border-b border-line/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-2">
            <Sparkles className="size-4 animate-spin text-accent" />
            <span>Interactive 3D Lifecycle Architecture</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-ink">
            چرخه حیات هوشمند مرسولات پستی
          </h2>
          <p className="mt-1.5 text-sm text-muted max-w-xl">
            نشانگر موس را روی آیکون‌های سه‌بعدی نگه دارید تا بزرگ‌نمایی شوند و مسیرهای مجاز هر وضعیت را مشاهده کنید.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-brand" /> مبدأ
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-accent" /> ترانزیت
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-success" /> نهایی
          </span>
        </div>
      </div>

      {/* 3D Interactive Nodes Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 py-4">
        {LIFECYCLE_STEPS.map((step) => {
          const Icon = step.icon;
          const isSelected = activeStatus === step.status;
          const isHovered = hoveredStatus === step.status;
          const isLegalNext = currentStep.nextStatuses.includes(step.status);

          return (
            <div
              key={step.status}
              onClick={() => setActiveStatus(step.status)}
              onMouseEnter={() => setHoveredStatus(step.status)}
              onMouseLeave={() => setHoveredStatus(null)}
              className="group relative flex flex-col items-center cursor-pointer select-none"
            >
              {/* 3D Orb Button */}
              <div
                className={`relative grid size-16 sm:size-20 place-items-center rounded-2xl bg-gradient-to-br ${step.gradient} transition-all duration-300 ease-out transform group-hover:scale-125 group-hover:-translate-y-3 group-hover:rotate-2`}
                style={{
                  boxShadow: isHovered || isSelected
                    ? `0 20px 30px -5px ${step.shadowColor}, inset 0 2px 3px rgba(255,255,255,0.7), inset 0 -3px 6px rgba(0,0,0,0.4)`
                    : `0 8px 16px -2px ${step.shadowColor}, inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                  border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {/* 3D Top Bevel Light Reflex */}
                <div
                  className="absolute inset-x-2 top-1.5 h-3 rounded-t-xl opacity-60 bg-gradient-to-b from-white to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Pulsing indicator if active or next legal */}
                {isLegalNext && (
                  <span
                    className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-brand ring-2 ring-white animate-ping"
                    aria-hidden="true"
                  />
                )}

                {/* 3D Center Icon with floating shadow */}
                <Icon
                  className="size-7 sm:size-9 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
                  style={{ color: step.iconColor }}
                  aria-hidden="true"
                />
              </div>

              {/* Status Titles */}
              <span className="mt-3 text-xs font-bold text-ink text-center leading-tight transition-colors group-hover:text-brand">
                {step.englishTitle}
              </span>
              <span className="text-[11px] font-medium text-muted text-center truncate max-w-full">
                {step.persianTitle}
              </span>

              {/* Legal Next Transition Badge */}
              {isLegalNext && (
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-brand tracking-wider">
                  گام بعدی
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Inspector Card Displaying Domain Rules */}
      <div className="mt-10 rounded-card border border-line bg-surface p-6 sm:p-7 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line/70 pb-5">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${currentStep.gradient} shadow-md text-white`}
            >
              <currentStep.icon className="size-6 drop-shadow" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-ink">{currentStep.persianTitle}</h3>
                <span className="font-mono text-xs font-bold text-muted bg-subtle px-2 py-0.5 rounded">
                  {currentStep.englishTitle}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                مسئول اعتبارسنجی انتقال: <strong className="text-brand">{currentStep.role}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">مرحله:</span>
            <span className="rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-bold text-brand uppercase">
              {currentStep.category}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink/90 font-medium">
          {currentStep.description}
        </p>

        {/* Legal Transitions Forward */}
        <div className="mt-6 pt-5 border-t border-line/60">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-brand" />
            <span>گام‌های قانونی بعدی (Legal Domain State Transitions):</span>
          </p>

          {currentStep.nextStatuses.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-control bg-subtle px-3 py-1.5 text-xs font-bold text-muted">
              ✓ وضعیت نهایی (Terminal State) — پرونده مرسوله بسته می‌شود.
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {currentStep.nextStatuses.map((nxt) => {
                const target = LIFECYCLE_STEPS.find((s) => s.status === nxt);
                if (!target) return null;
                const TargetIcon = target.icon;
                return (
                  <button
                    key={nxt}
                    type="button"
                    onClick={() => setActiveStatus(nxt)}
                    className="inline-flex items-center gap-2 rounded-control border border-line bg-subtle/50 px-3 py-1.5 text-xs font-bold text-ink hover:border-brand hover:bg-brand/10 transition-all cursor-pointer shadow-2xs"
                  >
                    <TargetIcon className="size-3.5 text-brand" />
                    <span>{target.englishTitle} ({target.persianTitle})</span>
                    <ArrowRight className="size-3 text-muted" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
