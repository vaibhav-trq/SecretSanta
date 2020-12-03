import { AddMessage, GetErrorMessage } from "./common.js";

const { firebase } = window;

interface IAddress {
  street: string,
  street2: string,
  city: string,
  state: string,
  zip: string,
  [key: string]: string,
};
interface ISettings {
  text_notifications: string | null,
  [key: string]: string | null,
};
interface IUserData {
  address: IAddress,
  settings: ISettings,
};


export const LoadUserData = async (): Promise<IUserData> => {
  const user = firebase.auth().currentUser!;
  const ref = firebase.database().ref(`users/${user.uid}`);
  const val = await ref.once('value');
  return val.val();
};

export const UpdateTextNotification = async (element: JQuery<HTMLElement>) => {
  const user = firebase.auth().currentUser!;
  const ref = firebase.database().ref(`users/${user.uid}/settings`);
  const checked = element.prop('checked');
  try {
    if (checked) {
      if (!user.phoneNumber) {
        return AddMessage(element, 'No phone number on record.');
      }
      await ref.update({ text_notifications: user.phoneNumber });
      AddMessage(element, 'Enabled text messages.', true);
    } else {
      await ref.update({ text_notifications: null });
      AddMessage(element, 'Disabled text messages.', true);
    }
  } catch (e) {
    AddMessage(element, GetErrorMessage(e));
    element.prop('checked', !checked);
  }
};

export const UpdateAddressData = async (element: JQuery<HTMLElement>) => {
  const user = firebase.auth().currentUser!;
  const ref = firebase.database().ref(`users/${user.uid}/address`);

  const attr = element.attr('name')!;
  const value = element.val()?.toString() || '';
  try {
    await ref.update({ [attr]: value });
    AddMessage(element, 'Updated!', true);
  } catch (e) {
    AddMessage(element, GetErrorMessage(e));
    const orig = await LoadUserData();
    element.val(orig.address[attr]);
  }
}
