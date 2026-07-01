import { userType } from "@/lib/utils";
import { create } from "zustand";

type authStore = {
  user: userType | null;

  loading: boolean;

  fetchUser: () => void;

  clearUser: () => void;
};

export const useAuthStore = create<authStore>((set) => ({
  user: null,

  loading: true,

  fetchUser: async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/jwt`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        set({ user: null, loading: false });
        return;
      }

      const data = await res.json();
      set({ user: data.user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));
