import { Id } from "@/convex/_generated/dataModel";

export type Organization = {
  _id: Id<"organizations">;
  _creationTime: number;
  name: string;
  description: string | null;
  image: string | null;
};

export type Organizations = Organization[];

export type UserOrganization = {
  _id: Id<"organizations">;
  _creationTime: number;
  name: string;
  description: string | null;
  image: string | null;
  createdBy: Id<"users">;
  role: "Member" | "Manager" | "Admin";
};

export type UserOrganizations = UserOrganization[];

export type UserProfile = {
  _id: Id<"users">;
  _creationTime: number;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type { Id, Doc } from "@/convex/_generated/dataModel";
export type { TableNames } from "@/convex/_generated/dataModel";
