"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Zap } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/ui/tabs";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/modules/auth/components/login-form";
import { RegisterForm } from "@/modules/auth/components/register-form";

export default function Auth() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<string>(() => {
    const tab = searchParams.get("tab");
    return tab === "register" ? "register" : "login";
  });

  return (
    <LayoutGroup>
      <div className="flex min-h-screen w-full bg-background-dim">
        {/* Branding Panel - Animates position based on active tab */}
        <motion.div
          layout
          initial={false}
          animate={{ scale: 1 }}
          transition={{
            layout: {
              duration: 0.7,
              ease: [0.32, 0.72, 0, 1],
              type: "spring",
              stiffness: 100,
              damping: 20,
            },
            scale: { duration: 0.4 },
          }}
          className={`hidden lg:flex lg:flex-1 bg-linear-to-br from-primary to-orange-600 relative overflow-hidden ${
            activeTab === "register" ? "order-2" : "order-1"
          }`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
          <AnimatePresence mode="wait">
            <motion.div
              key={`branding-content-${activeTab}`}
              initial={{
                opacity: 0,
                x: activeTab === "login" ? -60 : 60,
                scale: 0.95,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: activeTab === "login" ? 60 : -60,
                scale: 0.95,
                filter: "blur(10px)",
              }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 flex flex-col justify-center px-12 text-white"
            >
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <Zap className="w-16 h-16 mb-6" />
                </motion.div>
                <motion.h2
                  className="text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {activeTab === "login"
                    ? t("auth.welcomeBack")
                    : t("auth.startJourney")}
                </motion.h2>
                <motion.p
                  className="text-xl text-white/90 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {activeTab === "login"
                    ? t("auth.welcomeBackSubtitle")
                    : t("auth.startJourneySubtitle")}
                </motion.p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          layout
          initial={false}
          animate={{ scale: 1 }}
          transition={{
            layout: {
              duration: 0.7,
              ease: [0.32, 0.72, 0, 1],
              type: "spring",
              stiffness: 100,
              damping: 20,
            },
            scale: { duration: 0.4 },
          }}
          className={`flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 ${
            activeTab === "register" ? "order-1" : "order-2"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`form-wrapper-${activeTab}`}
              initial={{
                opacity: 0,
                x: activeTab === "login" ? 60 : -60,
                scale: 0.95,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: activeTab === "login" ? -60 : 60,
                scale: 0.95,
                filter: "blur(10px)",
              }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="mx-auto w-full max-w-md"
            >
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Zap className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.span
                    className="font-bold text-3xl text-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {t("config.appName")}
                  </motion.span>
                </div>
              </motion.div>

              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="px-4 pt-4"
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-lg">
                      <TabsTrigger
                        value="login"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
                      >
                        {t("auth.signIn")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
                      >
                        {t("auth.signUp")}
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>

                  <TabsContent value="login" className="p-8 pt-6">
                    <LoginForm />
                  </TabsContent>

                  <TabsContent value="register" className="p-8 pt-6">
                    <RegisterForm />
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
