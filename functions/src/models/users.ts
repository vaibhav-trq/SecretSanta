
interface IAddress {
  street: string,
  street2: string,
  city: string,
  state: string,
  zip: string,
};

interface ISettings {
  phone: string | null,
  email: string | null,
  text_notifications: string | null,
};

export class Settings implements ISettings {
  phone: string | null;
  email: string | null;
  text_notifications: string | null;

  constructor(verified: boolean, phone?: string, email?: string) {
    this.phone = phone || null;
    this.email = verified ? email! : null;
    this.text_notifications = null;
  }
}

export const createAddress = (): IAddress => {
  return {
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
  }
}
