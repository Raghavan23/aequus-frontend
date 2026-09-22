export interface Client {
  id: string;
  organizationId: string;
  name: string;
  gstin?: string;
  pan?: string;
  tallyCompanyName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  gstin?: string;
  pan?: string;
  tallyCompanyName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}
