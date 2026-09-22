import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  Home,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmptyState, ErrorState, LoadingState } from '../../components/page-state';
import { Button, Card, Field, Input, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import type { Address, AddressInput } from '../../types';

const schema = z.object({
  label: z.string().trim().min(1, 'Label is required.'),
  line1: z.string().trim().min(5, 'Enter a complete street address.'),
  city: z.string().trim().min(2, 'City is required.'),
  province: z.string().trim().min(2, 'Province is required.'),
  postalCode: z.string().trim().min(5, 'Valid postal code is required.'),
  isDefault: z.boolean(),
});

function getAddressIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('home') || l.includes('house')) return Home;
  if (l.includes('office') || l.includes('work') || l.includes('hq')) return Building2;
  return MapPin;
}

export default function AddressesPage() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<Address | null | undefined>(undefined);
  const [message, setMessage] = useState('');

  const query = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<Address[]>('/customer/addresses'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/customer/addresses/${id}`),
    onSuccess: async () => {
      setMessage('Address removed from address book.');
      await client.invalidateQueries({ queryKey: ['addresses'] });
      setTimeout(() => setMessage(''), 4000);
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Address book"
        title="Sender and return addresses"
        description="Shipment addresses are snapshotted at creation, ensuring past tracking and shipping records remain immutable."
        action={
          <Button onClick={() => setEditing(null)} className="gap-2 shadow-sm">
            <Plus className="size-4" />
            <span>Add address</span>
          </Button>
        }
      />

      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-control border border-success/30 bg-success/10 p-3.5 text-sm font-semibold text-success animate-in fade-in"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {query.isLoading && <LoadingState label="Loading addresses" />}
      {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

      {query.data?.length === 0 && (
        <EmptyState
          title="No saved addresses"
          description="Add a sender address before creating a shipment to snapshot return locations."
          action={<Button onClick={() => setEditing(null)}>Add first address</Button>}
        />
      )}

      {query.data && query.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((address) => {
            const Icon = getAddressIcon(address.label);
            return (
              <Card
                key={address.id}
                className="flex flex-col p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all relative border-line/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-control bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </span>

                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-bold text-brand">
                      <Star className="size-3 fill-brand text-brand" />
                      Default
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-base font-bold text-ink">{address.label}</h2>

                <address className="mt-2 text-xs not-italic leading-relaxed text-muted flex-1">
                  <p className="text-ink/90 font-medium">{address.line1}</p>
                  <p className="mt-1">
                    {address.city}, {address.province}
                  </p>
                  <p className="font-mono text-muted/80 mt-0.5 tracking-wider">{address.postalCode}</p>
                </address>

                <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setEditing(address)}
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger/10 hover:text-danger gap-1.5"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete "${address.label}" from address book?`)) {
                        remove.mutate(address.id);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddressDialog
        value={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
        onSaved={async () => {
          setEditing(undefined);
          setMessage('Address saved successfully.');
          await client.invalidateQueries({ queryKey: ['addresses'] });
          setTimeout(() => setMessage(''), 4000);
        }}
      />
    </>
  );
}

function AddressDialog({
  value,
  onOpenChange,
  onSaved,
}: {
  value: Address | null | undefined;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      line1: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false,
    },
  });

  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (value !== undefined) {
      reset(
        value ?? {
          label: '',
          line1: '',
          city: '',
          province: '',
          postalCode: '',
          isDefault: false,
        },
      );
    }
  }, [value, reset]);

  const submit = handleSubmit(async (input) => {
    setServerError('');
    try {
      if (value) await api.put(`/customer/addresses/${value.id}`, input);
      else await api.post('/customer/addresses', input);
      await onSaved();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not save address.');
    }
  });

  return (
    <Dialog.Root open={value !== undefined} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-canvas/75 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-line bg-surface p-6 sm:p-7 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-bold tracking-tight text-ink">
                {value ? 'Edit address' : 'Add new address'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted">
                Used as an immutable sender and return location for your parcels.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" className="size-9 px-0 rounded-control" aria-label="Close">
                <X className="size-4.5" />
              </Button>
            </Dialog.Close>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="sm:col-span-2">
              <Field label="Address label" htmlFor="address-label" error={errors.label?.message}>
                <Input id="address-label" placeholder="e.g. Home, Office, Tehran Warehouse" {...register('label')} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Street address" htmlFor="address-line" error={errors.line1?.message}>
                <Input
                  id="address-line"
                  placeholder="Street, building, apartment, unit"
                  {...register('line1')}
                />
              </Field>
            </div>

            <Field label="City" htmlFor="address-city" error={errors.city?.message}>
              <Input id="address-city" placeholder="e.g. Tehran" {...register('city')} />
            </Field>

            <Field label="Province" htmlFor="address-province" error={errors.province?.message}>
              <Input id="address-province" placeholder="e.g. Tehran" {...register('province')} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Postal code" htmlFor="address-postal" error={errors.postalCode?.message}>
                <Input id="address-postal" placeholder="10-digit postal code" {...register('postalCode')} />
              </Field>
            </div>

            <label className="sm:col-span-2 flex min-h-11 items-center gap-3 text-sm font-semibold text-ink cursor-pointer">
              <input className="size-4.5 accent-brand cursor-pointer" type="checkbox" {...register('isDefault')} />
              <span>Set as default sender address</span>
            </label>

            {serverError && (
              <p className="sm:col-span-2 text-sm text-danger rounded-control bg-danger/10 p-3" role="alert">
                {serverError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-line/70 pt-4 sm:col-span-2 mt-2">
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save address'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
