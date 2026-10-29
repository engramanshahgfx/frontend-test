"use client";
import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { authAPI } from "@/lib/api";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({ name: "My Name" });
  const [categories, setCategories] = useState({
    en: [],
    ar: [],
  });
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [articles, setArticles] = useState([]);

  // Fetch user profile from API only if authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        // A guest flight checkout token is scoped to one booking and has no profile.
        if (!token || localStorage.getItem('auth_token_scope') === 'guest') {
          // Not authenticated yet, skip fetch
          return;
        }
        const response = await authAPI.getUser();
        if (response?.user) {
          setProfileData(response.user);
        }
      } catch (error) {
        // Only log if token exists (authenticated user)
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <Context.Provider
      value={{
        profileData,
        categories,
        products,
        contacts,
        admins,
        articles,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
