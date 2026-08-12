export default function Logo({ subtitle }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="leading-tight text-center">
        <div className="font-display font-bold text-[19px] tracking-tight text-noori-primary-dark">
          NOORI <span className="text-noori-gold">TRAVELS</span>
        </div>
        {subtitle && (
          <div className="text-[10px] tracking-[0.18em] text-noori-muted uppercase -mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
