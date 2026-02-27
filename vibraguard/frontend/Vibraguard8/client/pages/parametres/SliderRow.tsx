import * as SliderPrimitive from "@radix-ui/react-slider";

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  trackColor: string;
  valueColor: string;
  displayValue: string;
  minLabel: string;
  maxLabel: string;
}

export function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  trackColor,
  valueColor,
  displayValue,
  minLabel,
  maxLabel,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#E6F0F2] text-sm font-medium">{label}</span>
        <div className="flex items-center px-2.5 py-[5px] rounded border border-black/[0.08] bg-[#05080C] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.5)]">
          <span
            className="font-mono text-sm font-semibold tracking-[0.5px]"
            style={{ color: valueColor }}
          >
            {displayValue}
          </span>
        </div>
      </div>

      <SliderPrimitive.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="relative flex w-full touch-none select-none items-center my-1"
      >
        <SliderPrimitive.Track className="relative h-[6px] w-full grow rounded-[3px] bg-[#0B2C3A] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
          <SliderPrimitive.Range
            className="absolute h-full rounded-[3px]"
            style={{ background: trackColor }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block w-4 h-4 rounded-full bg-white border-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.4)] focus:outline-none cursor-pointer"
          style={{ borderColor: trackColor }}
        />
      </SliderPrimitive.Root>

      <div className="flex justify-between mt-1">
        <span className="text-[#C9E7E6] text-xs">{minLabel}</span>
        <span className="text-[#C9E7E6] text-xs">{maxLabel}</span>
      </div>
    </div>
  );
}
