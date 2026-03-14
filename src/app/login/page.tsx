"use client";

import { useUser } from "@/hooks/useUser";
import { ArrowLeft, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      login(data.user);
      router.push("/profile");
    } catch (err: any) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-4 flex items-center">
        <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="ml-2 font-bold text-lg text-gray-900">登录</h1>
      </header>
      
      <div className="flex-1 px-8 pt-12">
        <div className="text-center mb-10">
            <div className="text-3xl font-extrabold text-orange-500 mb-2">Welcome Back</div>
            <p className="text-sm text-gray-400">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <UserIcon size={18} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Username" 
                        className="flex-1 outline-none text-sm"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        required
                    />
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Lock size={18} className="text-gray-400" />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="flex-1 outline-none text-sm"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-full shadow-lg active:scale-95 transition-all text-sm disabled:opacity-50"
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
            Don't have an account? <Link href="/register" className="text-orange-500 font-bold hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
}