// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import LanguageSwitcher from "@/src/components/language-switcher";
import { useSubscriptions } from "@/src/hooks/use-subscriptions";
import { useTranslation, useList, captureException } from "@webtools/client";
import { useState } from "react";

type ListItem = {
  _id: string;
  values: Record<string, unknown>;
  order: number;
};

export default function Home() {
  const { t, locale } = useTranslation("common");
  const { list, loading, error } = useList("team");
  const {
    data: subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
  } = useSubscriptions();

  const [customErrorTitle, setCustomErrorTitle] = useState("");
  const [customErrorStatus, setCustomErrorStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [customErrorSending, setCustomErrorSending] = useState(false);

  const submitCustomError = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomErrorStatus(null);

    if (!customErrorTitle.trim()) {
      setCustomErrorStatus({
        type: "error",
        text: t("customErrorTitleRequired"),
      });
      return;
    }

    try {
      setCustomErrorSending(true);
      await captureException(new Error(customErrorTitle));
      setCustomErrorStatus({ type: "success", text: t("customErrorSuccess") });
      setCustomErrorTitle("");
    } finally {
      setCustomErrorSending(false);
    }
  };

  const triggerError = async () => {
    const syncErrors = [
      () => {
        const obj = null as unknown as {
          nonExistentProperty: { deeplyNested: string };
        };
        return obj.nonExistentProperty.deeplyNested;
      },
      () => {
        const undefinedVar = undefined as unknown as { foo: () => void };
        return undefinedVar.foo();
      },
      () => {
        const fn = "not a function" as unknown as () => void;
        fn();
      },
      () => {
        JSON.parse("{invalid json,,}");
      },
      () => {
        decodeURIComponent("%E0%A4%A");
      },
      () => {
        encodeURI("\uD800");
      },
      () => {
        const circular: Record<string, unknown> = {};
        circular.self = circular;
        JSON.stringify(circular);
      },
      () => {
        const recurse = (): number => recurse() + 1;
        recurse();
      },
      () => {
        const arr: number[] = [];
        Object.defineProperty(arr, "length", { writable: false });
        arr.push(1);
      },
      () => {
        const frozen = Object.freeze({ x: 1 });
        (frozen as { x: number }).x = 2;
      },
      () => {
        new Array(-1);
      },
      () => {
        (1.23).toFixed(200);
      },
      () => {
        return Symbol("test") + "";
      },
      () => {
        const bigint = 10n;
        return bigint + (5 as unknown as bigint);
      },
      () => {
        const map = new WeakMap();
        map.set("not an object" as unknown as object, 1);
      },
      () => {
        Reflect.construct(Math.floor as unknown as new () => object, []);
      },
      () => {
        const proto = Object.create(null);
        proto.toString();
      },
      () => {
        const arr = [1, 2, 3] as unknown as {
          flat: (depth: number) => number[];
        };
        arr.flat(-Infinity);
      },
    ];

    const asyncErrors = [
      async () => {
        const res = await fetch(
          `https://this-domain-definitely-does-not-exist-${Math.random().toString(36).slice(2)}.invalid/api/data`,
        );
        return res.json();
      },
      async () => {
        const res = await fetch("https://httpstat.us/500");
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} from ${res.url}`,
          );
      },
      async () => {
        const res = await fetch("https://httpstat.us/404");
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} from ${res.url}`,
          );
      },
      async () => {
        const res = await fetch("https://httpstat.us/401");
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} from ${res.url}`,
          );
      },
      async () => {
        const res = await fetch("https://httpstat.us/403");
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} from ${res.url}`,
          );
      },
      async () => {
        const res = await fetch("https://httpstat.us/429");
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} from ${res.url}`,
          );
      },
      async () => {
        const res = await fetch("https://httpstat.us/503");
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} from ${res.url}`,
          );
      },
      async () => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 50);
        await fetch("https://httpstat.us/200?sleep=5000", {
          signal: controller.signal,
        });
      },
      async () => {
        await fetch("not-a-valid-url");
      },
      async () => {
        await fetch("http://localhost:1/api/nothing");
      },
      async () => {
        const res = await fetch("https://www.google.com/");
        return res.json();
      },
      async () => {
        await fetch("ftp://example.com/file");
      },
      async () => {
        await fetch("https://jsonplaceholder.typicode.com/posts", {
          method: "POST",
          body: JSON.stringify({ foo: () => "cannot serialize" }),
        });
      },
      async () => {
        await import(`./non-existent-module-${Math.random()}`);
      },
      async () => {
        await Promise.reject(
          new Error(`Unhandled rejection at ${new Date().toISOString()}`),
        );
      },
      async () => {
        const img = new Image();
        await new Promise((_, reject) => {
          img.onerror = () =>
            reject(new Error(`Failed to load image: ${img.src}`));
          img.src = `https://broken-image-${Math.random()}.invalid/image.png`;
        });
      },
      async () => {
        const ws = new WebSocket(
          `wss://nonexistent-${Math.random().toString(36).slice(2)}.invalid`,
        );
        await new Promise((_, reject) => {
          ws.onerror = () =>
            reject(new Error(`WebSocket failed to connect to ${ws.url}`));
          ws.onclose = (e) =>
            reject(new Error(`WebSocket closed (code ${e.code})`));
        });
      },
      async () => {
        localStorage.setItem("overflow", "x".repeat(50_000_000));
      },
      async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const req = indexedDB.open("__missing_db__", 999);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        db.transaction("nonexistentStore", "readonly");
      },
    ];

    const allErrors = [...syncErrors, ...asyncErrors];
    const pick = allErrors[Math.floor(Math.random() * allErrors.length)];
    await pick();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <span className="text-lg font-bold tracking-tight text-orange-500">
          Web Tools
        </span>
        <LanguageSwitcher />
      </nav>

      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="mb-4 inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-medium text-orange-600">
          {t("currentLocale", { locale: locale.toUpperCase() })}
        </div>
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
          {t("heroTitle")}
        </h1>
        <p className="mb-3 max-w-xl text-lg text-zinc-500">
          {t("heroSubtitle")}
        </p>
        <p className="mb-10 max-w-md text-sm text-zinc-400">
          {t("heroDescription")}
        </p>
        <div className="flex gap-4">
          <a
            href="#team"
            className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            {t("teamTitle")}
          </a>
          <a
            href="#features"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-600 transition hover:border-orange-300 hover:text-orange-600"
          >
            {t("featuresTitle")}
          </a>
        </div>
      </section>

      <section
        className="border-t border-zinc-200 bg-zinc-50 px-6 py-24"
        id="features"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t("featuresTitle")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">{t("featureI18n")}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {t("featureI18nDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">{t("featureLists")}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {t("featureListsDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">{t("featureErrors")}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {t("featureErrorsDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 px-6 py-24" id="packages">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            {t("packagesTitle")}
          </h2>
          <p className="mb-12 text-center text-zinc-400">
            {t("packagesSubtitle")}
          </p>
          <div className="space-y-4">
            {[
              {
                name: t("pkgClientName"),
                desc: t("pkgClientDesc"),
                install: "npm i @webtools/client",
                usage:
                  'import { useTranslation, useList } from "@webtools/client"',
              },
              {
                name: t("pkgI18nName"),
                desc: t("pkgI18nDesc"),
                install: null,
                usage:
                  'const { t, locale, changeLocale } = useTranslation("common")',
              },
              {
                name: t("pkgListsName"),
                desc: t("pkgListsDesc"),
                install: null,
                usage: 'const { list, loading, error } = useList("team")',
              },
              {
                name: t("pkgErrorKitName"),
                desc: t("pkgErrorKitDesc"),
                install: null,
                usage: "<NextErrorProvider>{children}</NextErrorProvider>",
              },
              {
                name: t("pkgCliName"),
                desc: t("pkgCliDesc"),
                install: "npm i -g @uu-webtools/cli",
                usage: "npx webtools init",
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-orange-500">
                      {pkg.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-500">
                      {pkg.desc}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:text-right">
                    {pkg.install && (
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                          {t("pkgInstall")}
                        </span>
                        <code className="mt-0.5 block rounded bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600">
                          {pkg.install}
                        </code>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                        {t("pkgUsage")}
                      </span>
                      <code className="mt-0.5 block rounded bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600">
                        {pkg.usage}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 px-6 py-24" id="team">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            {t("teamTitle")}
          </h2>
          <p className="mb-12 text-center text-zinc-400">{t("teamSubtitle")}</p>

          {loading && (
            <p className="text-center text-zinc-400">{t("loading")}</p>
          )}

          {error && (
            <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-medium text-red-600">{t("errorTitle")}</p>
              <p className="mt-1 text-sm text-red-400">
                {t("errorDescription")}
              </p>
            </div>
          )}

          {list && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((member: ListItem) => (
                <div
                  key={member._id}
                  className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-4">
                    {member.values.profil ? (
                      <img
                        src={member.values.profil as string}
                        alt={member.values.title as string}
                        className="h-14 w-14 rounded-full border-2 border-zinc-200 object-cover transition group-hover:border-orange-300"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-200 bg-orange-50 text-lg font-bold text-orange-500">
                        {(member.values.title as string)?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {member.values.title as string}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {t("age", { age: member.values.age as string })}
                      </p>
                    </div>
                  </div>
                  {(member.values.bio as string) ? (
                    <p className="mb-4 text-sm leading-relaxed text-zinc-500">
                      {member.values.bio as string}
                    </p>
                  ) : null}
                  {(member.values.profil as string) ? (
                    <a
                      href={member.values.profil as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-orange-500 transition hover:text-orange-700"
                    >
                      {t("viewProfile")} →
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-300">
                      {t("noProfile")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="border-t border-zinc-200 bg-zinc-50 px-6 py-24"
        id="pricing"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            {t("pricingTitle")}
          </h2>
          <p className="mb-12 text-center text-zinc-400">
            {t("pricingSubtitle")}
          </p>

          {subscriptionsLoading && (
            <p className="text-center text-zinc-400">{t("loading")}</p>
          )}

          {subscriptionsError && (
            <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-medium text-red-600">{t("errorTitle")}</p>
              <p className="mt-1 text-sm text-red-400">
                {t("errorDescription")}
              </p>
            </div>
          )}

          {subscriptions && (
            <div className="grid gap-6 sm:grid-cols-3">
              {subscriptions.items.map((plan: ListItem, index: number) => {
                const isMiddle = index === 1;
                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-xl border p-6 transition ${isMiddle ? "border-orange-400 bg-white shadow-lg ring-2 ring-orange-100" : "border-zinc-200 bg-white shadow-sm"}`}
                  >
                    <h3 className="mb-1 text-lg font-bold capitalize">
                      {plan.values.name as string}
                    </h3>
                    <div className="mb-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-orange-500">
                        {plan.values.price as number}
                      </span>
                      <span className="text-sm text-zinc-400">
                        {t("pricingCurrency")}
                        {t("pricingPeriod")}
                      </span>
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-zinc-500">
                      {plan.values.description as string}
                    </p>
                    <button
                      type="button"
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${isMiddle ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-zinc-300 text-zinc-600 hover:border-orange-300 hover:text-orange-600"}`}
                    >
                      {t("pricingSelect")}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-zinc-200 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            {t("interpolationDemo")}
          </h2>
          <p className="mb-8 text-zinc-400">useTranslation + {"{values}"}</p>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">
              {t("interpolationResult", {
                name: "Daniel",
                day: "pondělí",
                month: "duben",
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            {t("errorDemoTitle")}
          </h2>
          <p className="mb-8 text-sm text-zinc-400">{t("errorDemoDesc")}</p>
          <button
            type="button"
            onClick={triggerError}
            className="rounded-lg border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100"
          >
            {t("triggerError")}
          </button>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">
              {t("customErrorTitle")}
            </h2>
            <p className="text-sm text-zinc-400">{t("customErrorDesc")}</p>
          </div>

          <form
            onSubmit={submitCustomError}
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label
                htmlFor="custom-error-title"
                className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                {t("customErrorTitleLabel")}
              </label>
              <input
                id="custom-error-title"
                type="text"
                value={customErrorTitle}
                onChange={(e) => setCustomErrorTitle(e.target.value)}
                placeholder={t("customErrorTitlePlaceholder")}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {customErrorStatus && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  customErrorStatus.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {customErrorStatus.text}
              </div>
            )}

            <button
              type="submit"
              disabled={customErrorSending}
              className="w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {customErrorSending
                ? t("customErrorSending")
                : t("customErrorSubmit")}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-8 text-center text-sm text-zinc-400">
        {t("footerText")}
      </footer>
    </div>
  );
}
