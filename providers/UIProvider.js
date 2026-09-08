"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const UIContext = createContext();

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
};

export default function UIProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get current language from pathname
  const getCurrentLang = () => {
    const match = pathname?.match(/^\/(en|ar|zh)(?:\/|$)/);
    return match ? match[1] : 'en';
  };

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, mode: "login" });
  const [bookingModal, setBookingModal] = useState({
    open: false,
    trip: null, 
  });
  const [reservationModal, setReservationModal] = useState({
    open: false,
    trip: null, 
  });
  const [pendingTrip, setPendingTrip] = useState(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const triggerDashboardRefresh = React.useCallback(() => setDashboardRefreshKey(k => k + 1), []);

  const openUserDrawer = React.useCallback(() => {
    setUserDrawerOpen(true);
  }, []);

  const closeUserDrawer = React.useCallback(() => {
    setUserDrawerOpen(false);
  }, []);

  const openAuthModal = React.useCallback((mode = "login") => {
    const lang = getCurrentLang();
    const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    const page = mode === "register" ? "register" : "login";
    
    if (returnUrl && typeof window !== 'undefined') {
      sessionStorage.setItem('auth_return_url', returnUrl);
    }
    
    router.push(`/${lang}/${page}`);
  }, [router, pathname]);

  const closeAuthModal = React.useCallback(() => {
    setAuthModal((s) => ({ ...s, open: false }));
  }, []);

  const openBookingModal = React.useCallback((trip = {}) => {
    setPendingTrip(null);
    setBookingModal({ open: true, trip });
  }, []);

  const closeBookingModal = React.useCallback(() => {
    setBookingModal({ open: false, trip: null });
  }, []);

  const openBookingOrAuth = React.useCallback((trip = {}) => {
    if (isAuthenticated) {
      openBookingModal(trip);
    } else {
      // Store pending trip for after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_booking_trip', JSON.stringify(trip));
      }
      setPendingTrip(trip);
      openAuthModal("login");
    }
  }, [isAuthenticated, openBookingModal, openAuthModal]);

  // ============================================
  // RESERVATION MODAL (No Authentication Required)
  // ============================================
  const openReservationModal = React.useCallback((trip = {}) => {
    setReservationModal({ open: true, trip });
  }, []);

  const closeReservationModal = React.useCallback(() => {
    setReservationModal({ open: false, trip: null });
  }, []);

  const handleAuthSuccess = React.useCallback(() => {
    closeAuthModal();
    if (pendingTrip) {
      openBookingModal(pendingTrip);
    }
    setPendingTrip(null);
  }, [pendingTrip, closeAuthModal, openBookingModal]);

  const value = useMemo(
    () => ({
      authModal,
      bookingModal,
      reservationModal,
      pendingTrip,
      // User Drawer State
      isUserDrawerOpen: userDrawerOpen,
      openUserDrawer,
      closeUserDrawer,
      // Dashboard refresh helpers
      dashboardRefreshKey,
      triggerDashboardRefresh,
      openAuthModal,
      closeAuthModal,
      openBookingModal,
      closeBookingModal,
      openBookingOrAuth,
      openReservationModal,
      closeReservationModal,
      handleAuthSuccess,
      setAuthModal,
      setBookingModal,
      setReservationModal,
    }),
    [authModal, bookingModal, reservationModal, isAuthenticated, pendingTrip, dashboardRefreshKey, userDrawerOpen, openUserDrawer, closeUserDrawer]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}