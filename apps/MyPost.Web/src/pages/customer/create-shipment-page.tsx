import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Compass,
  FileText,
  MapPin,
  Package,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { EmptyState, ErrorState, LoadingState } from '../../components/page-state';
import { Button, Card, CopyButton, Field, Input, PageHeader, Select } from '../../components/ui';
import { api } from '../../lib/api';
import type { Address, ShipmentDetail } from '../../types';

const schema = z
  .object({
    senderAddressId: z.string().min(1, 'Select a sender address.'),
    recipientName: z.string().trim().min(2, 'Recipient name is required.'),
    recipientPhone: z.string().regex(/^09\d{9}$/, 'Use an 11-digit mobile number beginning with 09.'),
    destinationLabel: z.string().trim().min(1),
    destinationLine1: z.string().trim().min(5),
    destinationCity: z.string().trim().min(2),
    destinationProvince: z.string().trim().min(2),
    destinationPostalCode: z.string().trim().min(5),
    type: z.enum(['Letter', 'Parcel']),
    serviceLevel: z.enum(['Economy', 'Standard', 'Express']),
    weightGrams: z.coerce.number().positive().max(50_000),
    lengthCm: z.coerce.number().optional(),
    widthCm: z.coerce.number().optional(),
    heightCm: z.coerce.number().optional(),
  })
  .superRefine((value, context) => {
    if (value.type === 'Parcel' && (!value.lengthCm || !value.widthCm || !value.heightCm)) {
      context.addIssue({
        code: 'custom',
        path: ['lengthCm'],
        message: 'All parcel dimensions are required.',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const steps = [
  { label: 'Sender', icon: MapPin },
  { label: 'Recipient', icon: Compass },
  { label: 'Package', icon: Package },
  { label: 'Review', icon: CheckCircle2 },
];

export default function CreateShipmentPage() {
  const [step, setStep] = useState(0);
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: () => api.get<Address[]>('/customer/addresses') });
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      senderAddressId: '',
      type: 'Letter',
      serviceLevel: 'Standard',
      weightGrams: 100,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.post<ShipmentDetail>('/customer/shipments', {
        senderAddressId: values.senderAddressId,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        destination: {
          label: values.destinationLabel,
          line1: values.destinationLine1,
          city: values.destinationCity,
          province: values.destinationProvince,
          postalCode: values.destinationPostalCode,
          country: 'Iran',
        },
        type: values.type,
        weightGrams: values.weightGrams,
        dimensions:
          values.type === 'Parcel'
            ? { lengthCm: values.lengthCm, widthCm: values.widthCm, heightCm: values.heightCm }
            : null,
        serviceLevel: values.serviceLevel,
        customerReference: crypto.randomUUID(),
      }),
  });

  const values = watch();

  async function next() {
    const fields: (keyof FormValues)[][] = [
      ['senderAddressId'],
      [
        'recipientName',
        'recipientPhone',
        'destinationLabel',
        'destinationLine1',
        'destinationCity',
        'destinationProvince',
        'destinationPostalCode',
      ],
      ['type', 'serviceLevel', 'weightGrams', 'lengthCm', 'widthCm', 'heightCm'],
    ];
    if (await trigger(fields[step])) {
      setStep((val) => Math.min(3, val + 1));
    }
  }

  if (addresses.isLoading) return <LoadingState label="Loading shipment form" />;
  if (addresses.isError) return <ErrorState error={addresses.error} onRetry={() => void addresses.refetch()} />;

  if (addresses.data?.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="New shipment"
          title="Create shipment"
          description="A sender address is required before shipment details can be snapshotted."
        />
        <EmptyState
          title="Add a sender address first"
          description="Your saved address becomes the immutable sender and return snapshot for this shipment."
          action={
            <Link to="/customer/addresses">
              <Button>Add address</Button>
            </Link>
          }
        />
      </>
    );
  }

  if (mutation.data) {
    return (
      <>
        <PageHeader
          eyebrow="Shipment created"
          title="Ready for postal acceptance"
          description="The server validated, priced, and assigned a unique tracking code to your shipment."
        />
        <Card className="max-w-2xl p-8 sm:p-10 text-center mx-auto shadow-lg border-line/80">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/10 text-success shadow-inner">
            <PackageCheck className="size-8" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">Unique tracking identifier</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-control bg-subtle px-4 py-2">
            <span className="font-mono text-xl font-extrabold tracking-widest text-ink">
              {mutation.data.trackingCode}
            </span>
            <CopyButton text={mutation.data.trackingCode} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-control border border-line/70 bg-surface p-4 text-left">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Authoritative price</span>
              <p className="mt-1 font-mono text-base font-bold text-ink">
                {mutation.data.calculatedPrice.toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted">IRR</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Service level</span>
              <p className="mt-1 text-sm font-bold text-ink capitalize">
                {mutation.data.serviceLevel} · {mutation.data.type}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`/customer/shipments/${mutation.data.id}`}>
              <Button size="lg" className="w-full sm:w-auto">
                View shipment details
              </Button>
            </Link>
            <Link to={`/track/${mutation.data.trackingCode}`}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Public tracking
              </Button>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="New shipment"
        title="Create shipment"
        description="Four guided steps with server-side validation and deterministic pricing."
      />

      {/* Modern Stepper Header */}
      <nav aria-label="Creation progress" className="mt-2">
        <ol className="grid grid-cols-4 gap-2 sm:gap-4">
          {steps.map((st, index) => {
            const isCompleted = index < step;
            const isCurrent = index === step;
            const Icon = st.icon;

            return (
              <li
                key={st.label}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative flex items-center gap-2 rounded-control border p-3 transition-all ${
                  isCurrent
                    ? 'border-brand bg-brand/5 shadow-2xs'
                    : isCompleted
                      ? 'border-line bg-subtle/40 text-muted'
                      : 'border-line/60 bg-transparent text-muted/60'
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-brand text-white shadow-xs'
                      : isCompleted
                        ? 'bg-success/15 text-success'
                        : 'bg-subtle text-muted'
                  }`}
                >
                  {isCompleted ? <Check className="size-4" /> : <Icon className="size-3.5" />}
                </span>

                <div className="min-w-0 hidden sm:block">
                  <p className={`text-xs font-bold ${isCurrent ? 'text-ink' : 'text-muted'}`}>
                    {st.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Wizard Form */}
      <form onSubmit={handleSubmit((input) => mutation.mutate(input))} noValidate className="mt-6">
        <Card className="p-6 sm:p-8 shadow-xs border-line/80">
          {/* STEP 0: Sender Address */}
          {step === 0 && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Choose sender and return address</h2>
                <p className="mt-1 text-sm text-muted">
                  A complete snapshot is permanently kept with this shipment record.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.data!.map((address) => {
                  const isSelected = values.senderAddressId === address.id;
                  return (
                    <label
                      key={address.id}
                      className={`relative cursor-pointer rounded-card border p-4.5 transition-all ${
                        isSelected
                          ? 'border-brand bg-brand/5 ring-2 ring-brand/20 shadow-xs'
                          : 'border-line hover:border-line/80 hover:bg-subtle/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            className="size-4 accent-brand cursor-pointer"
                            type="radio"
                            value={address.id}
                            {...register('senderAddressId')}
                          />
                          <strong className="text-sm font-bold text-ink">{address.label}</strong>
                        </div>
                        {address.isDefault && (
                          <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pl-7 text-xs leading-relaxed text-muted">
                        <p>{address.line1}</p>
                        <p className="mt-0.5 font-medium text-ink/80">
                          {address.city}, {address.province} · {address.postalCode}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {errors.senderAddressId && (
                <p className="rounded-control bg-danger/10 border border-danger/20 p-3 text-sm text-danger" role="alert">
                  {errors.senderAddressId.message}
                </p>
              )}
            </section>
          )}

          {/* STEP 1: Recipient & Destination */}
          {step === 1 && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Recipient and destination</h2>
                <p className="mt-1 text-sm text-muted">
                  Specify recipient contact credentials and delivery destination within the network.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Recipient name" htmlFor="recipientName" error={errors.recipientName?.message}>
                  <Input
                    id="recipientName"
                    placeholder="Full name of recipient"
                    {...register('recipientName')}
                  />
                </Field>

                <Field
                  label="Recipient phone"
                  htmlFor="recipientPhone"
                  hint="11 digits starting with 09 (e.g. 09123456789)"
                  error={errors.recipientPhone?.message}
                >
                  <Input
                    id="recipientPhone"
                    inputMode="tel"
                    placeholder="09123456789"
                    {...register('recipientPhone')}
                  />
                </Field>

                <Field
                  label="Address label"
                  htmlFor="destinationLabel"
                  error={errors.destinationLabel?.message}
                >
                  <Input
                    id="destinationLabel"
                    placeholder="Home, Office, Headquarters..."
                    {...register('destinationLabel')}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="Street address"
                    htmlFor="destinationLine1"
                    error={errors.destinationLine1?.message}
                  >
                    <Input
                      id="destinationLine1"
                      placeholder="Street, avenue, building, unit number"
                      {...register('destinationLine1')}
                    />
                  </Field>
                </div>

                <Field label="City" htmlFor="destinationCity" error={errors.destinationCity?.message}>
                  <Input id="destinationCity" placeholder="e.g. Shiraz" {...register('destinationCity')} />
                </Field>

                <Field label="Province" htmlFor="destinationProvince" error={errors.destinationProvince?.message}>
                  <Input id="destinationProvince" placeholder="e.g. Fars" {...register('destinationProvince')} />
                </Field>

                <Field label="Postal code" htmlFor="destinationPostalCode" error={errors.destinationPostalCode?.message}>
                  <Input id="destinationPostalCode" placeholder="10-digit postal code" {...register('destinationPostalCode')} />
                </Field>
              </div>
            </section>
          )}

          {/* STEP 2: Package, Dimensions & Service */}
          {step === 2 && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Package and service options</h2>
                <p className="mt-1 text-sm text-muted">
                  Dimensional measurements and weight determine authoritative postage computation.
                </p>
              </div>

              {/* Visual Selection Buttons for Type */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                  Shipment category
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('type', 'Letter')}
                    className={`flex items-center gap-3.5 rounded-card border p-4 text-left transition-all cursor-pointer ${
                      values.type === 'Letter'
                        ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                        : 'border-line hover:bg-subtle/30'
                    }`}
                  >
                    <span className="grid size-10 place-items-center rounded-control bg-brand/10 text-brand">
                      <FileText className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold text-ink text-sm">Letter / Document</p>
                      <p className="text-xs text-muted">Envelopes, paper docs (up to 1kg)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue('type', 'Parcel')}
                    className={`flex items-center gap-3.5 rounded-card border p-4 text-left transition-all cursor-pointer ${
                      values.type === 'Parcel'
                        ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                        : 'border-line hover:bg-subtle/30'
                    }`}
                  >
                    <span className="grid size-10 place-items-center rounded-control bg-accent/10 text-accent">
                      <Boxes className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold text-ink text-sm">Box / Parcel</p>
                      <p className="text-xs text-muted">Requires dimensions (L × W × H)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Shipment type" htmlFor="type" error={errors.type?.message}>
                  <Select id="type" {...register('type')}>
                    <option value="Letter">Letter</option>
                    <option value="Parcel">Parcel</option>
                  </Select>
                </Field>

                <Field label="Service level" htmlFor="serviceLevel" error={errors.serviceLevel?.message}>
                  <Select id="serviceLevel" {...register('serviceLevel')}>
                    <option value="Economy">Economy (3-5 business days)</option>
                    <option value="Standard">Standard (1-2 business days)</option>
                    <option value="Express">Express (Next-day priority)</option>
                  </Select>
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="Weight (grams)"
                    htmlFor="weightGrams"
                    hint="Weight up to 50,000 grams (50kg)"
                    error={errors.weightGrams?.message}
                  >
                    <Input
                      id="weightGrams"
                      type="number"
                      min="1"
                      max="50000"
                      {...register('weightGrams')}
                    />
                  </Field>
                </div>

                {values.type === 'Parcel' && (
                  <div className="grid grid-cols-3 gap-3 sm:col-span-2 rounded-card border border-line/80 bg-subtle/30 p-4">
                    <Field label="Length cm" htmlFor="lengthCm" error={errors.lengthCm?.message}>
                      <Input id="lengthCm" type="number" min="1" placeholder="cm" {...register('lengthCm')} />
                    </Field>
                    <Field label="Width cm" htmlFor="widthCm">
                      <Input id="widthCm" type="number" min="1" placeholder="cm" {...register('widthCm')} />
                    </Field>
                    <Field label="Height cm" htmlFor="heightCm">
                      <Input id="heightCm" type="number" min="1" placeholder="cm" {...register('heightCm')} />
                    </Field>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 3: Review Shipment Summary */}
          {step === 3 && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Review shipment manifest</h2>
                <p className="mt-1 text-sm text-muted">
                  Confirm all details before generating the authoritative shipment record.
                </p>
              </div>

              <div className="rounded-card border border-line/80 bg-surface p-6 shadow-xs divide-y divide-line/60">
                <div className="grid gap-6 sm:grid-cols-2 pb-6">
                  <ReviewItem
                    icon={MapPin}
                    label="Sender address"
                    value={addresses.data!.find((item) => item.id === values.senderAddressId)?.label ?? '—'}
                    subtext={addresses.data!.find((item) => item.id === values.senderAddressId)?.line1}
                  />

                  <ReviewItem
                    icon={Compass}
                    label="Recipient details"
                    value={`${values.recipientName}`}
                    subtext={`${values.recipientPhone} · ${values.destinationLabel}`}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 pt-6">
                  <ReviewItem
                    icon={Truck}
                    label="Destination destination"
                    value={`${values.destinationCity}, ${values.destinationProvince}`}
                    subtext={`${values.destinationLine1} (${values.destinationPostalCode})`}
                  />

                  <ReviewItem
                    icon={Package}
                    label="Package & Service"
                    value={`${values.weightGrams} g ${values.type.toLowerCase()} · ${values.serviceLevel}`}
                    subtext={
                      values.type === 'Parcel' && values.lengthCm
                        ? `${values.lengthCm} × ${values.widthCm} × ${values.heightCm} cm`
                        : undefined
                    }
                  />
                </div>
              </div>

              {mutation.isError && (
                <div className="rounded-control bg-danger/10 border border-danger/20 p-4 text-sm text-danger" role="alert">
                  {mutation.error.message}
                </div>
              )}
            </section>
          )}
        </Card>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={step === 0 || mutation.isPending}
            onClick={() => setStep((val) => val - 1)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </Button>

          {step < 3 ? (
            <Button onClick={() => void next()} className="gap-2 px-6">
              <span>Continue</span>
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending} className="gap-2 px-6">
              <span>{mutation.isPending ? 'Creating shipment…' : 'Create shipment'}</span>
              <PackageCheck className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </>
  );
}

function ReviewItem({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-control bg-brand/10 text-brand mt-0.5">
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1 text-sm font-bold text-ink">{value}</p>
        {subtext && <p className="mt-0.5 text-xs text-muted leading-relaxed">{subtext}</p>}
      </div>
    </div>
  );
}
