export interface Organization {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
  planTier: string;
  createdAt: string;
}

export interface OrganizationRequest {
  name: string;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
}
