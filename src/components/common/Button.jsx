const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
  ghost: 'hover:bg-slate-100 text-slate-700',
  success: 'bg-green-600 hover:bg-green-700 text-white',
}

export function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
