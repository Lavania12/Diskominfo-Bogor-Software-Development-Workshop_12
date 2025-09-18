"use client";

import { useState } from "react";
import { message } from "antd";

export default function TestLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      message.error("Username dan password wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        success: response.ok,
        data: data
      });

      if (response.ok) {
        message.success("Login berhasil!");
      } else {
        message.error(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("Login error:", error);
      setResult({
        status: 0,
        success: false,
        data: { message: "Network error: " + error.message }
      });
      message.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Test Login Admin
          </h1>
          <p className="text-gray-600">
            Test halaman login admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username atau Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan username atau email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : (
              "Test Login"
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <div className={`p-3 rounded ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                <strong>Status:</strong> {result.status} {result.success ? '(Success)' : '(Failed)'}
              </p>
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                <strong>Message:</strong> {result.data.message}
              </p>
              {result.success && result.data.admin && (
                <div className="mt-2">
                  <p className="text-sm text-green-800">
                    <strong>Admin Data:</strong>
                  </p>
                  <pre className="text-xs text-green-700 mt-1 bg-green-100 p-2 rounded">
                    {JSON.stringify(result.data.admin, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Kembali ke Login Admin
          </a>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Test Credentials:</strong><br/>
            Username: <code>admin</code><br/>
            Email: <code>admin@diskominfo-bogor.go.id</code><br/>
            Password: <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
