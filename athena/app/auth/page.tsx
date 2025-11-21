"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Zap,
  AlertCircle,
  CheckCircle2,
  Github,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/ui/tabs";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useLoader } from "@/modules/core/hooks/use-loader";
import { Input } from "@/modules/core/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const saveName = useMutation(api.myFunctions.saveName);
  const { setLoading } = useLoader();

  // Get initial tab from URL query parameter
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tab = searchParams.get("tab");
    return tab === "register" ? "register" : "login";
  });

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading({
      loading: true,
      title: "Logging in",
      description: "We are logging you in...",
    });
    setError(null);

    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);
    formData.set("flow", "signIn");

    try {
      await signIn("password", formData);
      setLoading({
        loading: true,
        title: "Logged in",
        description: "You have been logged in successfully",
        state: "success",
      });
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading({
        loading: false,
        title: "Error logging in",
        description: "An error occurred while logging you in",
        state: "error",
      });
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading({
      loading: true,
      title: "Creating account",
      description: "We are creating your account...",
    });
    setError(null);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("email", data.email);
    formData.set("password", data.password);
    formData.set("flow", "signUp");

    try {
      await signIn("password", formData);
      await saveName({ name: data.name });
      setLoading({
        loading: true,
        title: "Account created",
        description: "Your account has been created successfully",
        state: "success",
      });
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading({
        loading: false,
        title: "Error creating account",
        description: "An error occurred while creating your account",
        state: "error",
      });
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setLoading({
      loading: true,
      title: `Signing in with ${provider === "github" ? "GitHub" : "Google"}`,
      description: "Redirecting to authentication...",
    });
    setError(null);

    try {
      await signIn(provider);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading({
        loading: false,
        title: "Error signing in",
        description: `An error occurred while signing in with ${provider === "github" ? "GitHub" : "Google"}`,
        state: "error",
      });
    }
  };

  // Animation variants for staggered effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const formFieldVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: custom * 0.1,
      },
    }),
  };

  return (
    <LayoutGroup>
      <div className="flex h-[calc(100vh-64px)] w-full bg-background-dim">
        {/* Branding Panel - Animates position based on active tab */}
        <motion.div
          layout
          initial={false}
          animate={{
            scale: 1,
          }}
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
              transition={{
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1],
              }}
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
                    ? "Welcome back to Athena"
                    : "Start your journey with Athena"}
                </motion.h2>
                <motion.p
                  className="text-xl text-white/90 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {activeTab === "login"
                    ? "Your all-in-one platform for creating powerful, scalable applications with real-time data."
                    : "Join thousands of developers building the next generation of applications."}
                </motion.p>
              </motion.div>
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "login" ? (
                  <>
                    <motion.div
                      className="flex items-start gap-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">Lightning Fast</h3>
                        <p className="text-white/80 text-sm">
                          Built for performance and speed
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-start gap-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">
                          Secure by Default
                        </h3>
                        <p className="text-white/80 text-sm">
                          Enterprise-grade security built in
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-start gap-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">Scale with Ease</h3>
                        <p className="text-white/80 text-sm">
                          Grow from prototype to production
                        </p>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="flex items-start gap-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">Free to Start</h3>
                        <p className="text-white/80 text-sm">
                          No credit card required to get started
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-start gap-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">
                          Deploy in Minutes
                        </h3>
                        <p className="text-white/80 text-sm">
                          From idea to production in record time
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-start gap-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">24/7 Support</h3>
                        <p className="text-white/80 text-sm">
                          Our team is here to help you succeed
                        </p>
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Form Panel - Animates position based on active tab */}
        <motion.div
          layout
          initial={false}
          animate={{
            scale: 1,
          }}
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
              transition={{
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="mx-auto w-full max-w-md"
            >
              {/* Logo */}
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
                    Athena
                  </motion.span>
                </div>
              </motion.div>

              {/* Form Card with Tabs */}
              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* Tab Headers */}
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
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>

                  {/* Login Tab Content */}
                  <TabsContent value="login" className="p-8 pt-6">
                    <div>
                      <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          Welcome back
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Sign in to your account to continue
                        </p>
                      </motion.div>

                      <form
                        onSubmit={handleSubmitLogin(handleLogin)}
                        className="space-y-5"
                      >
                        {/* Email Input */}
                        <motion.div
                          custom={0}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <label
                            htmlFor="login-email"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Email address
                          </label>
                          <Input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            icon={{ name: Mail, position: "left" }}
                            error={loginErrors.email?.message}
                            aria-invalid={!!loginErrors.email}
                            {...registerLogin("email")}
                          />
                        </motion.div>

                        {/* Password Input */}
                        <motion.div
                          custom={1}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <label
                            htmlFor="login-password"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Password
                          </label>
                          <Input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            icon={{ name: Lock, position: "left" }}
                            error={loginErrors.password?.message}
                            aria-invalid={!!loginErrors.password}
                            {...registerLogin("password")}
                          />
                        </motion.div>

                        {/* Error Message */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: 20,
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                              <p className="text-sm text-destructive">
                                {error}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                          custom={2}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                          Sign in
                        </motion.button>

                        {/* Divider */}
                        <motion.div
                          custom={3}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                          className="relative flex items-center justify-center"
                        >
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative px-4 text-sm text-muted-foreground bg-card">
                            Or continue with
                          </div>
                        </motion.div>

                        {/* Social Login Buttons */}
                        <motion.div
                          custom={4}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-2 gap-3"
                        >
                          <motion.button
                            type="button"
                            onClick={() => handleSocialLogin("github")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors font-medium text-sm"
                          >
                            <Github className="h-5 w-5" />
                            GitHub
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleSocialLogin("google")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors font-medium text-sm"
                          >
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Google
                          </motion.button>
                        </motion.div>
                      </form>
                    </div>
                  </TabsContent>

                  {/* Register Tab Content */}
                  <TabsContent value="register" className="p-8 pt-6">
                    <div>
                      <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          Create your account
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Get started with Athena today
                        </p>
                      </motion.div>

                      <form
                        onSubmit={handleSubmitRegister(handleRegister)}
                        className="space-y-5"
                      >
                        {/* Name Input */}
                        <motion.div
                          custom={0}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <label
                            htmlFor="register-name"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Full name
                          </label>
                          <Input
                            id="register-name"
                            type="text"
                            autoComplete="name"
                            placeholder="John Doe"
                            icon={{ name: User, position: "left" }}
                            error={registerErrors.name?.message}
                            aria-invalid={!!registerErrors.name}
                            {...registerRegister("name")}
                          />
                        </motion.div>

                        {/* Email Input */}
                        <motion.div
                          custom={1}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <label
                            htmlFor="register-email"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Email address
                          </label>
                          <Input
                            id="register-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            icon={{ name: Mail, position: "left" }}
                            error={registerErrors.email?.message}
                            aria-invalid={!!registerErrors.email}
                            {...registerRegister("email")}
                          />
                        </motion.div>

                        {/* Password Input */}
                        <motion.div
                          custom={2}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <label
                            htmlFor="register-password"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Password
                          </label>
                          <Input
                            id="register-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            icon={{ name: Lock, position: "left" }}
                            error={registerErrors.password?.message}
                            aria-invalid={!!registerErrors.password}
                            {...registerRegister("password")}
                          />
                        </motion.div>

                        {/* Error Message */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: 20,
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                              <p className="text-sm text-destructive">
                                {error}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                          custom={3}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                          Create account
                        </motion.button>

                        {/* Divider */}
                        <motion.div
                          custom={4}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                          className="relative flex items-center justify-center"
                        >
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative px-4 text-sm text-muted-foreground bg-card">
                            Or continue with
                          </div>
                        </motion.div>

                        {/* Social Login Buttons */}
                        <motion.div
                          custom={5}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-2 gap-3"
                        >
                          <motion.button
                            type="button"
                            onClick={() => handleSocialLogin("github")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors font-medium text-sm"
                          >
                            <Github className="h-5 w-5" />
                            GitHub
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleSocialLogin("google")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors font-medium text-sm"
                          >
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Google
                          </motion.button>
                        </motion.div>

                        {/* Terms */}
                        <motion.p
                          className="text-xs text-center text-muted-foreground"
                          custom={6}
                          variants={formFieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          By signing up, you agree to our{" "}
                          <a
                            href="#"
                            className="text-primary hover:text-primary/80"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="#"
                            className="text-primary hover:text-primary/80"
                          >
                            Privacy Policy
                          </a>
                        </motion.p>
                      </form>
                    </div>
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
