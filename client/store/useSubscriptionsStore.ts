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

export type Pagination = {
  currentPage: number;
  pageSize: number;
  totalSubscriptions: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type subscriptionsStore = {
  subscriptions: Subscription[];
  pagination: Pagination;
  setSubscriptions: (subs: Subscription[]) => void;
  setPagination: (pagination: Pagination) => void;
  addSubscription: (sub: Subscription) => void;
  editSubscription: (sub: Subscription) => void;
  deleteSubscription: (subId: string) => void; // was Subscription
};

const initialPagination: Pagination = {
  currentPage: 1,
  pageSize: 12,
  totalSubscriptions: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSubscriptionStore = create<subscriptionsStore>((set) => ({
  subscriptions: [],
  pagination: initialPagination,
  setSubscriptions: (subs) => set({ subscriptions: subs }),
  setPagination: (pagination) => set({ pagination }),
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
