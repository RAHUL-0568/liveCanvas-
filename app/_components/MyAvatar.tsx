"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MyAvatar = () => {
  const { user } = useAuth();
  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");

  const imageUrl = convexUser?.image || user?.photoURL;
  const name = convexUser?.name || user?.displayName || "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar className="h-8 w-8 border border-border">
      <AvatarImage src={imageUrl} alt={name} className="object-cover" />
      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default MyAvatar;
