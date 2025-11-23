import { Id } from "@/convex/_generated/dataModel";

/**
 * Type for a single organization as returned from Convex (public API)
 */
export type Organization = {
  _id: Id<"organizations">;
  _creationTime: number;
  name: string;
  description: string | null;
  image: string | null;
};

/**
 * Type for array of organizations (public API)
 */
export type Organizations = Organization[];

/**
 * Type for user's organization with role information
 */
export type UserOrganization = {
  _id: Id<"organizations">;
  _creationTime: number;
  name: string;
  description: string | null;
  image: string | null;
  createdBy: Id<"users">;
  role: "Member" | "Manager" | "Admin";
};

/**
 * Type for array of user organizations
 */
export type UserOrganizations = UserOrganization[];

/**
 * Type for user profile
 */
export type UserProfile = {
  _id: Id<"users">;
  _creationTime: number;
  name: string | null;
  email: string | null;
  image: string | null;
};

/**
 * Re-export commonly used Convex types
 */
export type { Id, Doc } from "@/convex/_generated/dataModel";
export type { TableNames } from "@/convex/_generated/dataModel";
