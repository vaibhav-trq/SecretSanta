
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

interface IFavorites {
  drink: string,
  savory_snack: string,
  sweet_snack: string,
  shirt_size: string,
  shoe_size: string,
  more: string,
  love: string,
  dont_want: string,
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


export const createFavorites = (): IFavorites => {
  return {
    drink: "",
    savory_snack: "",
    sweet_snack: "",
    shirt_size: "",
    shoe_size: "",
    more: "",
    love: "",
    dont_want: "",
  }
};
