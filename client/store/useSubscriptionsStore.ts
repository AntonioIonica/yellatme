import { create } from "zustand";

export type Subscription = {
  id: String;
  name: String;
  description: String;
  price: Number;
  currency: String;
  frequency: String;
  category: String;
  paymentMethod: String;
  status: String;
  startDate: Date;
  renewalDate: Date;
  user: String;
};

export type Store = {
  subscriptions: Subscription[];
  setSubscriptions: (subs: Subscription[]) => void;
  addSubscription: (sub: Subscription) => void;
};

export const useSubscriptionStore = create<Store>((set) => ({
  subscriptions: [],
  setSubscriptions: (subs) => set({ subscriptions: subs }),
  addSubscription: (sub) =>
    set((state) => ({ subscriptions: [...state.subscriptions, sub] })),
}));
