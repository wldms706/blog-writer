'use client';

interface SelectionCardProps {
  id: string;
  icon?: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
  compact?: boolean;
}

export default function SelectionCard({
  icon,
  title,
  description,
  selected,
  onClick,
  badge,
  compact = false,
}: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden
        ${compact ? 'p-3' : 'p-5'}
        ${
          selected
            ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg'
            : 'border-border-light bg-background-card hover:border-secondary-dark hover:shadow-md'
        }
      `}
    >
      {/* Selection Indicator */}
      <div
        className={`absolute right-3 flex items-center justify-center transition-all duration-300
          ${compact ? 'top-3 w-4 h-4' : 'top-4 w-5 h-5'}
          rounded-full border-2
          ${
            selected
              ? 'border-primary bg-primary'
              : 'border-border bg-transparent'
          }
        `}
      >
        {selected && (
          <svg
            className={compact ? 'w-2.5 h-2.5 text-white' : 'w-3 h-3 text-white'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <div className="mb-2">
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/20 text-warning">
            {badge}
          </span>
        </div>
      )}

      <div className={`flex items-start pr-6 ${compact ? 'gap-2' : 'gap-4 pr-8'}`}>
        {icon && (
          <span className={`flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${compact ? 'text-xl mt-0' : 'text-3xl mt-0.5'}`}>
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold transition-colors ${compact ? 'text-sm mb-0.5' : 'text-lg mb-1'} ${
              selected ? 'text-primary' : 'text-text-primary'
            }`}
          >
            {title}
          </h3>
          <p className={`text-text-secondary leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        </div>
      </div>

      {/* Hover/Selected Background Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 transition-opacity duration-300
          ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
        `}
        style={{ zIndex: -1 }}
      />
    </button>
  );
}
