"use client";

import React, { useEffect, useMemo } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardTable from "./_components/DashboardTable";
import { useAuth } from "@/hooks/useAuth";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const convex = useConvex();
  const createUser = useMutation(api.user.createUser);
  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");

  // Adapt Firebase user to the format expected by DashboardHeader
  const adaptedUser = useMemo(() => {
    if (!user) return null;
    const defaultName = user.email ? user.email.split("@")[0] : "User";
    
    let name = user.displayName || defaultName;
    if (convexUser?.firstName) {
      name = `${convexUser.firstName} ${convexUser.lastName || ""}`.trim();
    }

    return {
      email: user.email || "",
      name: name,
      image: convexUser?.image || (user.photoURL?.includes("graph.facebook.com") ? `${user.photoURL}?type=large` : user.photoURL)
    };
  }, [user, convexUser]);

  useEffect(() => {
    if (user) {
      checkUser();
    }
  }, [user]);

  const updateUserImage = useMutation(api.user.updateUserImage);

  const checkUser = async () => {
    if (!user?.email) return;

    const result = await convex.query(api.user.getUser, {
      email: user.email,
    });
    
    let photoURL = user.photoURL;
    if (photoURL?.includes("graph.facebook.com")) {
      photoURL = `${photoURL}?type=large`;
    }
    
    if (!result.length) {
      const defaultName = user.email ? user.email.split("@")[0] : "User";
      const nameParts = (user.displayName || defaultName).trim().split(/\s+/);
      const firstName = nameParts[0] || defaultName;
      const lastName = nameParts.slice(1).join(" ");
      
      createUser({
        name: `${firstName} ${lastName}`.trim(),
        email: user.email,
        image: photoURL ?? "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais",
      });
    } else {
      // If user exists, sync the profile picture ONLY if it's currently the default placeholder
      // and we have a better one from Firebase. This prevents overwriting custom uploads.
      const existingUser = result[0];
      const defaultImage = "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg";
      const isDefault = !existingUser.image || existingUser.image.includes(defaultImage);
      
      if (isDefault && photoURL && existingUser.image !== photoURL) {
        updateUserImage({
          email: user.email,
          image: photoURL,
        });
      }
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-full pb-10">
      <DashboardHeader user={adaptedUser} />
      <div className="mt-12 md:mt-16">
        <DashboardTable isArchive={false} />
      </div>
    </div>
  );
};

export default DashboardPage;
