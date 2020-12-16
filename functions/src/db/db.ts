import * as admin from 'firebase-admin';
// This should be shared and copied between functions and public.

type Properties<T> = NonNullable<
  { [K in keyof T]: K }[keyof T]
>;

export class QueryBuilder<T> {
  ref: admin.database.Reference;

  constructor(ref = admin.database().ref()) {
    this.ref = ref;
  }

  child<U extends Properties<T>>(topic: string & Properties<T> & U) {
    return new QueryBuilder<NonNullable<T[U]>>(this.ref.child(topic));
  }

  async once(): Promise<[string | null, T]> {
    const res = await this.ref.once('value');
    return [res.key, res.val()];
  }

  onDirect(
    event: admin.database.EventType,
    cb: (key: string, item: T) => void
  ) {
    this.ref.on(event, (snapshot) => {
      cb(snapshot.key!, snapshot.val());
    });
  }

  on(
    event: admin.database.EventType,
    cb: (key: string, item: T[any]) => void,
    preLoop?: () => void,
    postLoop?: () => void
  ) {
    this.ref.on(event, (snapshot) => {
      if (preLoop) preLoop();
      snapshot.forEach((d) => {
        cb(d.key!, d.val());
        return false;
      });
      if (postLoop) postLoop();
    });
  }

  async push(item: T[any]) {
    return this.ref.push(item);
  }

  async update(item: Object) {
    return this.ref.update(item);
  }

  async set(item: T) {
    return this.ref.set(item);
  }

  async remove() {
    return this.ref.remove();
  }

  off() {
    this.ref.off();
  }
};

export const DbRoot = new QueryBuilder<SecretSanta.ISchema>();
