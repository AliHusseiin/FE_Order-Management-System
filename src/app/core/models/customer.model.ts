export interface Customer {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface AddressCreateRequest {
  addressType: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean; // Optional field with default value
}

export interface CustomerCreateRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  addresses?: AddressCreateRequest[]; // Optional address array
}
