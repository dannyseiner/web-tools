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

  // Auto-close loader after 1.7 seconds when state is success (but not error)
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
            className="fixed top-0 left-0 z-9999 flex h-screen w-full flex-col items-center justify-center gap-12 bg-background-dim/55 backdrop-blur-md"
          >
            {/* Animated Background Grid Pattern */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-size-[4rem_4rem]" />
              <motion.div
                className="absolute inset-0 bg-linear-to-tr from-primary/20 via-transparent to-orange-500/20"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center gap-8">
              {/* Loader Animation */}
              <div className="relative flex h-40 w-40 items-center justify-center">
                {loadingState.state ? (
                  // Success/Error State
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    className="relative"
                  >
                    {/* Background Glow */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "absolute inset-0 rounded-full blur-2xl",
                        loadingState.state === "success"
                          ? "bg-primary"
                          : "bg-destructive",
                      )}
                    />

                    {/* Icon Container */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 300,
                      }}
                      className={cn(
                        "relative flex h-32 w-32 items-center justify-center rounded-2xl border-2 shadow-2xl",
                        loadingState.state === "success"
                          ? "border-primary bg-primary/10"
                          : "border-destructive bg-destructive/10",
                      )}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {loadingState.state === "success" ? (
                          <Check
                            className="h-16 w-16 text-primary"
                            strokeWidth={3}
                          />
                        ) : (
                          <X
                            className="h-16 w-16 text-destructive"
                            strokeWidth={3}
                          />
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Corner Accents */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.4 + i * 0.05,
                          type: "spring",
                        }}
                        className={cn(
                          "absolute h-3 w-3 rounded-full",
                          loadingState.state === "success"
                            ? "bg-primary"
                            : "bg-destructive",
                          i === 0 && "-top-1 -left-1",
                          i === 1 && "-top-1 -right-1",
                          i === 2 && "-bottom-1 -left-1",
                          i === 3 && "-bottom-1 -right-1",
                        )}
                      />
                    ))}
                  </motion.div>
                ) : (
                  // Loading State with Code Brackets
                  <>
                    {/* Center Zap Icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        scale: { duration: 0.5 },
                        rotate: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                      className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-primary to-orange-600 shadow-lg"
                    >
                      <Zap className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Animated Code Brackets */}
                    <motion.div
                      className="absolute text-8xl font-bold text-primary"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.span
                        className="absolute -left-20 top-1/2 -translate-y-1/2"
                        animate={{
                          x: [-5, 5, -5],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        &lt;
                      </motion.span>
                      <motion.span
                        className="absolute -right-20 top-1/2 -translate-y-1/2"
                        animate={{
                          x: [5, -5, 5],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        /&gt;
                      </motion.span>
                    </motion.div>

                    {/* Orbiting Dots */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute h-3 w-3 rounded-full bg-linear-to-r from-primary to-orange-500"
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 3 - i * 0.3,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.3,
                        }}
                        style={{
                          offsetPath: `path("M ${70 + i * 10} 0 A ${70 + i * 10} ${70 + i * 10} 0 1 1 ${70 + i * 10} 0.1")`,
                          offsetDistance: "0%",
                        }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="h-full w-full rounded-full bg-linear-to-r from-primary to-orange-500 shadow-lg"
                        />
                      </motion.div>
                    ))}

                    {/* Hexagon Outline */}
                    <motion.svg
                      width="160"
                      height="160"
                      viewBox="0 0 160 160"
                      className="absolute"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: -360,
                      }}
                      transition={{
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.5 },
                        rotate: {
                          duration: 12,
                          repeat: Infinity,
                          ease: "linear",
                        },
                      }}
                    >
                      <motion.polygon
                        points="80,10 140,45 140,115 80,150 20,115 20,45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="10 5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="rgb(249, 115, 22)" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                  </>
                )}
              </div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                {loadingState.title && (
                  <motion.p
                    key={loadingState.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-foreground text-2xl font-bold"
                  >
                    {loadingState.title}
                  </motion.p>
                )}
                {loadingState.description && (
                  <motion.p
                    key={loadingState.description}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-muted-foreground max-w-[500px] text-sm"
                  >
                    {loadingState.description}
                  </motion.p>
                )}

                {/* Loading Dots */}
                {!loadingState.state && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-2 mt-2"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {loadingState.state === "error" && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCloseError}
                    className="mt-4 cursor-pointer rounded-lg bg-destructive px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-colors duration-200 hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
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
