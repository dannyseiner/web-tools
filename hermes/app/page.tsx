// @ts-check
"use client";

export default function Home() {
  const throwSync = () => {
    throw new Error("Synchronous throw in event handler");
  };

  const throwUnhandledPromise = () => {
    void Promise.reject(new Error("Unhandled promise rejection"));
  };

  const throwIndexOutOfBounds = () => {
    const arr = [1, 2, 3];
    const item = arr[99]; // out of bounds → undefined
    return item!.toFixed(2);
  };

  const throwUndefinedProperty = () => {
    const obj: { name: string; nested?: { deep: { value: string } } } = {
      name: "test",
    };
    return obj.nested!.deep.value;
  };

  const throwTypeError = () => {
    const notAFunction = 42 as unknown as () => void;
    notAFunction();
  };

  const throwJSONParse = () => {
    JSON.parse("{ invalid json }");
  };

  const throwInSetTimeout = () => {
    setTimeout(() => {
      throw new Error("Error inside setTimeout (async)");
    }, 100);
  };

  const throwInCatch = () => {
    try {
      throw new Error("Original error in try block");
    } catch (e) {
      throw new Error(
        "Re-thrown from catch: " + (e instanceof Error ? e.message : String(e)),
      );
    }
  };

  const throwReferenceError = () => {
    throw new ReferenceError("thisVariableDoesNotExist is not defined");
  };

  const throwRangeError = () => {
    const arr = [];
    arr.length = -1;
  };

  const triggers = [
    { label: "Sync throw", onClick: throwSync, desc: "Throws in handler" },
    {
      label: "Unhandled promise",
      onClick: throwUnhandledPromise,
      desc: "Promise.reject()",
    },
    {
      label: "Index out of bounds",
      onClick: throwIndexOutOfBounds,
      desc: "arr[99].toFixed()",
    },
    {
      label: "Undefined property",
      onClick: throwUndefinedProperty,
      desc: "obj.nested.deep.value",
    },
    {
      label: "TypeError (not a function)",
      onClick: throwTypeError,
      desc: "42()",
    },
    {
      label: "JSON.parse error",
      onClick: throwJSONParse,
      desc: "Invalid JSON",
    },
    {
      label: "setTimeout throw",
      onClick: throwInSetTimeout,
      desc: "Async throw after 100ms",
    },
    {
      label: "Re-throw from catch",
      onClick: throwInCatch,
      desc: "Throw inside catch",
    },
    {
      label: "ReferenceError",
      onClick: throwReferenceError,
      desc: "Undefined variable (eval)",
    },
    {
      label: "RangeError",
      onClick: throwRangeError,
      desc: "Invalid array length",
    },
  ] as const;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 font-sans dark:bg-black">
      <div className="w-full max-w-2xl">
        <p className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Error testing
        </p>
        <p className="mb-6 text-sm text-zinc-500">
          Each button triggers a different error type for testing the reporter.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {triggers.map(({ label, onClick, desc }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title={desc}
            >
              <span className="block">{label}</span>
              <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
