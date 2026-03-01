/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as errors from "../errors.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as languages from "../languages.js";
import type * as myFunctions from "../myFunctions.js";
import type * as notificationHelpers from "../notificationHelpers.js";
import type * as notifications from "../notifications.js";
import type * as organization from "../organization.js";
import type * as organizations from "../organizations.js";
import type * as profile from "../profile.js";
import type * as projectSettings from "../projectSettings.js";
import type * as projects from "../projects.js";
import type * as schemes_errors from "../schemes/errors.js";
import type * as schemes_notifications from "../schemes/notifications.js";
import type * as schemes_organization from "../schemes/organization.js";
import type * as schemes_project from "../schemes/project.js";
import type * as schemes_projectSettings from "../schemes/projectSettings.js";
import type * as schemes_translations from "../schemes/translations.js";
import type * as seed from "../seed.js";
import type * as translationEditors from "../translationEditors.js";
import type * as translations from "../translations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  errors: typeof errors;
  http: typeof http;
  invitations: typeof invitations;
  languages: typeof languages;
  myFunctions: typeof myFunctions;
  notificationHelpers: typeof notificationHelpers;
  notifications: typeof notifications;
  organization: typeof organization;
  organizations: typeof organizations;
  profile: typeof profile;
  projectSettings: typeof projectSettings;
  projects: typeof projects;
  "schemes/errors": typeof schemes_errors;
  "schemes/notifications": typeof schemes_notifications;
  "schemes/organization": typeof schemes_organization;
  "schemes/project": typeof schemes_project;
  "schemes/projectSettings": typeof schemes_projectSettings;
  "schemes/translations": typeof schemes_translations;
  seed: typeof seed;
  translationEditors: typeof translationEditors;
  translations: typeof translations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
