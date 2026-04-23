"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Check, X, Zap } from "lucide-react";
import React, { createContext, useEffect, useState } from "react";

interface LoaderContextType {
  loading: boolean;
  setLoading: (newState: LoadingProps) => void;
}

interface LoadingProps {
  title?: string;
  description?: string;
  loading: boolean;
  state?: "success" | "error" | null;
  onClose?: () => void;
}

export const LoaderContext = createContext<LoaderContextType>({
  loading: false,
  setLoading: () => {},
});

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [loadingState, setLoadingState] = useState<LoadingProps>({
    loading: false,
  });

  useEffect(() => {
    if (loadingState.loading && loadingState.state === "success") {
      const timer = setTimeout(() => {
        setLoadingState((prev) => ({ ...prev, loading: false, state: null }));
      }, 1700);

      return () => clearTimeout(timer);
    }
  }, [loadingState.loading, loadingState.state]);

  const handleCloseError = () => {
    setLoadingState((prev) => ({ ...prev, loading: false, state: null }));
    loadingState.onClose?.();
  };

  return (
    <LoaderContext.Provider
      value={{ loading: loadingState.loading, setLoading: setLoadingState }}
    >
      <AnimatePresence>
        {loadingState.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 z-9999 flex h-screen w-full flex-col items-center justify-center bg-background-dim/55 backdrop-blur-md"
          >
            <div className="relative flex flex-col items-center gap-10">
              <div className="relative flex h-28 w-28 items-center justify-center">
                {loadingState.state ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="relative flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      transition={{ delay: 0.2 }}
                      className={cn(
                        "absolute h-28 w-28 rounded-full blur-xl",
                        loadingState.state === "success"
                          ? "bg-primary"
                          : "bg-destructive",
                      )}
                    />

                    <motion.div
                      className={cn(
                        "relative flex h-20 w-20 items-center justify-center rounded-full border-2",
                        loadingState.state === "success"
                          ? "border-primary bg-primary/10"
                          : "border-destructive bg-destructive/10",
                      )}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.15,
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        {loadingState.state === "success" ? (
                          <Check
                            className="h-10 w-10 text-primary"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <X
                            className="h-10 w-10 text-destructive"
                            strokeWidth={2.5}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    <motion.svg
                      width="112"
                      height="112"
                      viewBox="0 0 112 112"
                      className="absolute"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="loader-gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity="1"
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity="0.1"
                          />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        fill="none"
                        stroke="url(#loader-gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="220 95"
                      />
                    </motion.svg>

                    <motion.div
                      className="absolute h-28 w-28 rounded-full border border-primary/20"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25"
                    >
                      <Zap className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                  </>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                {loadingState.title && (
                  <motion.p
                    key={loadingState.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-foreground text-lg font-semibold"
                  >
                    {loadingState.title}
                  </motion.p>
                )}
                {loadingState.description && (
                  <motion.p
                    key={loadingState.description}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className="text-muted-foreground max-w-[400px] text-sm"
                  >
                    {loadingState.description}
                  </motion.p>
                )}

                {!loadingState.state && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-1 flex gap-1.5"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {loadingState.state === "error" && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCloseError}
                    className="mt-3 cursor-pointer rounded-lg bg-destructive px-5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                  >
                    Close
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </LoaderContext.Provider>
  );
};
