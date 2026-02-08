export interface Student {
  id?: number;
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  organizationDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentInvolvement {
  club: string;
  role: string;
}

/**
 * Parse organization details string into structured array
 * Format: "Club: [name], Involvement: [role]; Club: [name], Involvement: [role]"
 * @param organizationDetails Raw organization details string
 * @returns Array of {club, role} objects
 */
export function parseOrganizationDetails(organizationDetails?: string): StudentInvolvement[] {
  if (!organizationDetails || organizationDetails.trim() === '') {
    return [];
  }

  const involvements: StudentInvolvement[] = [];
  
  // Split by semicolon to get individual organization entries
  const entries = organizationDetails.split(';').map(e => e.trim()).filter(e => e !== '');
  
  for (const entry of entries) {
    // Parse "Club: [name], Involvement: [role]" format
    const clubMatch = entry.match(/Club:\s*([^,]+)/i);
    const roleMatch = entry.match(/Involvement:\s*(.+)/i);
    
    if (clubMatch && roleMatch) {
      involvements.push({
        club: clubMatch[1].trim(),
        role: roleMatch[1].trim()
      });
    }
  }
  
  return involvements;
}
