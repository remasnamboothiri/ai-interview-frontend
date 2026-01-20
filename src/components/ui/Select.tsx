import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options && options.length > 0
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';


// import { forwardRef, SelectHTMLAttributes } from 'react';

// interface SelectOption {
//   value: string | number;
//   label: string;
// }

// interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
//   label?: string;
//   error?: string;
//   helperText?: string;
//   options: SelectOption[];
//   placeholder?: string;
// }

// export const Select = forwardRef<HTMLSelectElement, SelectProps>(
//   ({ label, error, helperText, options, placeholder, className = '', id, ...props }, ref) => {
//     const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

//     return (
//       <div className="w-full">
//         {label && (
//           <label
//             htmlFor={selectId}
//             className="block text-sm font-medium text-neutral-700 mb-1"
//           >
//             {label}
//           </label>
//         )}
//         <select
//           ref={ref}
//           id={selectId}
//           className={`input ${error ? 'input-error' : ''} ${className}`}
//           {...props}
//         >
//           {placeholder && (
//             <option value="" disabled>
//               {placeholder}
//             </option>
//           )}
//           {options.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//         {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
//         {!error && helperText && (
//           <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
//         )}
//       </div>
//     );
//   }
// );

// Select.displayName = 'Select';
