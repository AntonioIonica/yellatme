import { SubscriptionId } from "@/app/dashboard/subscriptions/page";
import { create } from "zustand";

export type Subscription = {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  paymentMethod: string;
  status: string;
  startDate: Date;
  renewalDate: Date;
  user: string;
};

export type subscriptionsStore = {
  subscriptions: Subscription[];
  setSubscriptions: (subs: Subscription[]) => void;
  addSubscription: (sub: Subscription) => void;
  editSubscription: (sub: Subscription) => void;
  deleteSubscription: (subId: SubscriptionId) => void;
};

export const useSubscriptionStore = create<subscriptionsStore>((set) => ({
  subscriptions: [],
  setSubscriptions: (subs) => set({ subscriptions: subs }),
  addSubscription: (sub) =>
    set((state) => ({ subscriptions: [...state.subscriptions, sub] })),
  editSubscription: (sub) =>
    set((state) => ({
      // map to iterate every object and check for condition
      subscriptions: state.subscriptions.map((subscription) =>
        // destructurate all the subscription field and destructurate all the updatedSub fields
        subscription._id === sub._id
          ? { ...subscription, ...sub }
          : subscription,
      ),
    })),
  deleteSubscription: (subId) =>
    set((state) => ({
      subscriptions: [
        ...state?.subscriptions?.filter((subItem) => subItem?._id !== subId),
      ],
    })),
}));
