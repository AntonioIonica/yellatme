import { userType } from "@/lib/utils";
import { create } from "zustand";

type authStore = {
  user: userType | null;
  loading: boolean;
  initialized: boolean;
  fetchUser: () => void;
  clearUser: () => void;
};

export const useAuthStore = create<authStore>((set) => ({
  user: null,
  initialized: false,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/jwt`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        set({ user: null, initialized: true });
        return;
      }

      const result = await res.json();

      set({ user: result.user, initialized: true });
    } catch (error) {
      set({ user: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));
