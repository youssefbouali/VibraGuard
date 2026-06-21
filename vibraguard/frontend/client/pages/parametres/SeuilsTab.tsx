import { SliderRow } from "./SliderRow";

interface SeuilsTabProps {
  value: number;
  onChange: (value: number) => void;
}

export function SeuilsTab({ value, onChange }: SeuilsTabProps) {
  return (
    <div className="max-w-md">
      <div className="flex flex-col p-6 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <SliderRow
          label="Seuil de Confiance Anomalie"
          value={value}
          onChange={onChange}
          min={51}
          max={100}
          step={1}
          trackColor="#0C6CF2"
          valueColor="#0C6CF2"
          displayValue={`${value} %`}
          minLabel="51%"
          maxLabel="100%"
        />
      </div>
    </div>
  );
}
