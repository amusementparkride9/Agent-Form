import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSSN(ssn: string): string {
  // Remove all non-numeric characters
  const cleaned = ssn.replace(/\D/g, '');
  
  // Ensure it's 9 digits, pad with leading zeros if necessary
  const padded = cleaned.padStart(9, '0');
  
  // Format as XXX-XX-XXXX
  if (padded.length === 9) {
    return `${padded.slice(0, 3)}-${padded.slice(3, 5)}-${padded.slice(5)}`;
  }
  
  // Return original if not valid format
  return ssn;
}

export function formatDateOfBirth(dob: string): string {
  // Handle date input (YYYY-MM-DD) and convert to MM/DD/YYYY
  try {
    const date = new Date(dob);
    if (isNaN(date.getTime())) {
      return dob; // Return original if invalid date
    }
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    return dob; // Return original if parsing fails
  }
}
