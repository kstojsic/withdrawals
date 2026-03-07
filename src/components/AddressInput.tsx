import { useState, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

interface AddressInputProps {
  value: Address;
  onChange: (a: Address) => void;
}

const allAddresses: Address[] = [
  { street: '10 Dundas Street East', city: 'Toronto', province: 'Ontario', postalCode: 'M5B 2G9' },
  { street: '100 King Street West', city: 'Toronto', province: 'Ontario', postalCode: 'M5X 1A1' },
  { street: '123 Maple Street', city: 'Toronto', province: 'Ontario', postalCode: 'M5V 2T6' },
  { street: '150 Eglinton Avenue East', city: 'Toronto', province: 'Ontario', postalCode: 'M4P 1E8' },
  { street: '1 Yonge Street', city: 'Toronto', province: 'Ontario', postalCode: 'M5E 1E5' },
  { street: '25 York Street', city: 'Toronto', province: 'Ontario', postalCode: 'M5J 2V5' },
  { street: '456 Queen Street West', city: 'Toronto', province: 'Ontario', postalCode: 'M5V 2A8' },
  { street: '789 Bloor Street West', city: 'Toronto', province: 'Ontario', postalCode: 'M6G 1L5' },
  { street: '200 University Avenue', city: 'Toronto', province: 'Ontario', postalCode: 'M5H 3C6' },
  { street: '5100 Erin Mills Parkway', city: 'Mississauga', province: 'Ontario', postalCode: 'L5M 4Z5' },
  { street: '321 Lakeshore Road East', city: 'Mississauga', province: 'Ontario', postalCode: 'L5G 1H3' },
  { street: '2655 North Sheridan Way', city: 'Mississauga', province: 'Ontario', postalCode: 'L5K 2P8' },
  { street: '50 Rideau Street', city: 'Ottawa', province: 'Ontario', postalCode: 'K1N 9J7' },
  { street: '111 Sussex Drive', city: 'Ottawa', province: 'Ontario', postalCode: 'K1N 5A1' },
  { street: '1000 Rue De La Gauchetière Ouest', city: 'Montreal', province: 'Quebec', postalCode: 'H3B 4W5' },
  { street: '987 Rue Saint-Denis', city: 'Montreal', province: 'Quebec', postalCode: 'H2X 3K4' },
  { street: '500 Rue Sainte-Catherine Ouest', city: 'Montreal', province: 'Quebec', postalCode: 'H3B 1A6' },
  { street: '321 Main Street', city: 'Vancouver', province: 'British Columbia', postalCode: 'V6B 3K9' },
  { street: '750 West Pender Street', city: 'Vancouver', province: 'British Columbia', postalCode: 'V6C 2T7' },
  { street: '1055 Dunsmuir Street', city: 'Vancouver', province: 'British Columbia', postalCode: 'V7X 1L4' },
  { street: '654 Granville Avenue', city: 'Calgary', province: 'Alberta', postalCode: 'T2P 3N4' },
  { street: '225 6th Avenue SW', city: 'Calgary', province: 'Alberta', postalCode: 'T2P 1N2' },
  { street: '10180 101 Street NW', city: 'Edmonton', province: 'Alberta', postalCode: 'T5J 3S4' },
  { street: '201 Portage Avenue', city: 'Winnipeg', province: 'Manitoba', postalCode: 'R3B 3K6' },
  { street: '1800 Hamilton Street', city: 'Regina', province: 'Saskatchewan', postalCode: 'S4P 0B3' },
];

export default function AddressInput({ value, onChange }: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<Address[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleStreetChange(street: string) {
    onChange({ ...value, street, city: '', province: '', postalCode: '' });
    setAutoFilled(false);
    if (street.length >= 1) {
      const q = street.toLowerCase();
      setFiltered(allAddresses.filter((a) => a.street.toLowerCase().includes(q)).slice(0, 6));
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  function selectAddress(addr: Address) {
    onChange(addr);
    setOpen(false);
    setAutoFilled(true);
  }

  return (
    <div>
      <p className="font-semibold text-base text-qt-primary leading-6 mb-4">Address of qualifying home</p>
      <div className="flex flex-col gap-4">
        <div className="relative" ref={wrapperRef}>
          <label className="text-sm leading-[22px] text-qt-primary block mb-1">Street address</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-qt-secondary" />
            <input
              type="text"
              placeholder="Start typing an address..."
              value={value.street}
              onChange={(e) => handleStreetChange(e.target.value)}
              onFocus={() => {
                if (value.street.length >= 1 && !autoFilled) {
                  const q = value.street.toLowerCase();
                  setFiltered(allAddresses.filter((a) => a.street.toLowerCase().includes(q)).slice(0, 6));
                  setOpen(true);
                }
              }}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="w-full h-12 rounded-md border border-qt-gray-dark bg-white pl-9 pr-4 text-sm text-qt-primary placeholder:text-qt-secondary placeholder:italic outline-none focus:border-qt-green"
            />
          </div>

          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-qt-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {filtered.map((addr, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => selectAddress(addr)}
                  className="w-full text-left px-4 py-3 hover:bg-qt-green-bg/40 cursor-pointer border-b border-qt-border last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-qt-gray-dark mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-qt-primary">{addr.street}</p>
                      <p className="text-xs text-qt-secondary">{addr.city}, {addr.province} {addr.postalCode}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm leading-[22px] text-qt-primary block mb-1">City</label>
            <input
              type="text"
              value={value.city}
              onChange={(e) => { onChange({ ...value, city: e.target.value }); setAutoFilled(false); }}
              className={`w-full h-12 rounded-md border bg-white px-4 text-sm text-qt-primary outline-none transition-colors
                ${autoFilled && value.city ? 'border-qt-green bg-qt-green-bg/20' : 'border-qt-gray-dark focus:border-qt-green'}`}
              readOnly={autoFilled && !!value.city}
            />
          </div>
          <div>
            <label className="text-sm leading-[22px] text-qt-primary block mb-1">Province</label>
            <input
              type="text"
              value={value.province}
              onChange={(e) => { onChange({ ...value, province: e.target.value }); setAutoFilled(false); }}
              className={`w-full h-12 rounded-md border bg-white px-4 text-sm text-qt-primary outline-none transition-colors
                ${autoFilled && value.province ? 'border-qt-green bg-qt-green-bg/20' : 'border-qt-gray-dark focus:border-qt-green'}`}
              readOnly={autoFilled && !!value.province}
            />
          </div>
          <div>
            <label className="text-sm leading-[22px] text-qt-primary block mb-1">Postal code</label>
            <input
              type="text"
              value={value.postalCode}
              onChange={(e) => { onChange({ ...value, postalCode: e.target.value }); setAutoFilled(false); }}
              className={`w-full h-12 rounded-md border bg-white px-4 text-sm text-qt-primary outline-none transition-colors
                ${autoFilled && value.postalCode ? 'border-qt-green bg-qt-green-bg/20' : 'border-qt-gray-dark focus:border-qt-green'}`}
              readOnly={autoFilled && !!value.postalCode}
            />
          </div>
        </div>

        {autoFilled && (
          <p className="text-xs text-qt-green-dark">City, province, and postal code auto-populated from selected address</p>
        )}
      </div>
    </div>
  );
}
