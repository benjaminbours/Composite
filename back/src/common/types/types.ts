// the shape is respecting JWT spec
export interface JWTUserPayload {
  username: string;
  sub: number; // user id
  role: number;
  clientId: number | undefined;
}

export interface JWTApplicationPayload {
  appname: string;
  sub: number; // application id
  role: number;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface DataInvoice {
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  companyName: string | undefined | null;
  vatNumber: string | undefined | null;
  address: any;
  // purchaseItems: PurchaseItem[] | undefined | null;
}
