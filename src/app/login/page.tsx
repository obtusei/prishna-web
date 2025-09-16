"use client";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type UserRegisterProps = {
  name: string;
  password: string;
  email: string;
  image?: string;
};

export default function LoginPage() {
  const [userInfo, setUserInfo] = useState<UserRegisterProps>({
    name: "",
    password: "",
    email: "",
  });

  const [loginInfo, setLoginInfo] = useState<{
    email: string;
    password: string;
    loading: boolean;
  }>({
    email: "",
    password: "",
    loading: false,
  });
  async function handleRegister() {
    if (userInfo) {
      setLoginInfo({ ...loginInfo, loading: true });
      const { data, error } = await authClient.signUp.email({
        name: userInfo?.name || "Default Name",
        email: userInfo?.email || "",
        password: userInfo?.password || "defaultPassword",
        callbackURL: "http://localhost:3000/login",
      });
      if (error) {
        // console.error("Registration error:", error);
        toast.error("Error creating a new user");
        return;
      }
      setLoginInfo({ ...loginInfo, loading: false });
      toast("User signed up successful");
    }
  }

  async function handleLogin() {
    if (loginInfo.email && loginInfo.password) {
      const { data, error } = await authClient.signIn.email({
        email: loginInfo?.email || "",
        password: loginInfo?.password || "defaultPassword",
        callbackURL: "http://localhost:3000",
      });
      if (error) {
        toast.error("Incorrect email or password");
        return;
      }
      console.log("Login successful:", data);
    } else {
      toast.error("Please enter email and password to login");
    }
  }

  const oauthSignins = () => {
    return (
      <>
        <Button
          variant={"outline"}
          onClick={handleLogin}
          className="w-full"
          size={"lg"}
        >
          <Icons.google />
          Continue with Google
        </Button>
        <Button
          variant={"outline"}
          onClick={handleLogin}
          className="w-full"
          size={"lg"}
        >
          <Icons.github />
          Continue with Github
        </Button>
      </>
    );
  };
  return (
    <div className="flex h-screen justify-center ">
      <div className="flex h-fit w-full p-10 max-w-xl flex-col gap-6">
        <Tabs defaultValue="login">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Log in to your account here. Click save when you&apos;re done.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Email</Label>
                  <Input
                    id="tabs-demo-name"
                    onChange={(e) => {
                      setLoginInfo((prev) => {
                        return { ...prev, email: String(e.target.value) };
                      });
                    }}
                    value={loginInfo.email}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Password</Label>
                  <Input
                    id="tabs-demo-username"
                    onChange={(e) => {
                      setLoginInfo((prev) => {
                        return { ...prev, password: String(e.target.value) };
                      });
                    }}
                    value={loginInfo.password}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button onClick={handleLogin} className="w-full" size={"lg"}>
                  Login
                </Button>
                {oauthSignins()}
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Full Name</Label>
                  <Input
                    id="tabs-demo-current"
                    type="text"
                    onChange={(e) => {
                      setUserInfo((prev: UserRegisterProps) => {
                        return { ...prev, name: String(e.target.value) };
                      });
                    }}
                    value={userInfo.name}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Email</Label>
                  <Input
                    id="tabs-demo-current"
                    type="email"
                    onChange={(e) => {
                      setUserInfo((prev: UserRegisterProps) => {
                        return { ...prev, email: String(e.target.value) };
                      });
                    }}
                    value={userInfo.email}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">Password</Label>
                  <Input
                    id="tabs-demo-new"
                    type="password"
                    onChange={(e) => {
                      setUserInfo((prev: UserRegisterProps) => {
                        return { ...prev, password: String(e.target.value) };
                      });
                    }}
                    value={userInfo.password}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full" onClick={handleRegister}>
                  Sign Up
                </Button>
                {oauthSignins()}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="text-center flex justify-center ">
          <p className="w-1/2 text-sm text-gray-400">
            By signing up, you acknowledge that you understand and agree to the
            <Link
              href={"/toc"}
              className="hover:opacity-100 underline hover:text-black duration-300 font-medium"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              href={"/toc"}
              className="hover:opacity-100 underline hover:text-black duration-300 font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
