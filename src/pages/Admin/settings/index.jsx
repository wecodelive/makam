import React, { useEffect, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { Bell, Lock, Users, Globe } from "lucide-react";
import {
  adminClearCache,
  adminGetSettings,
  adminResetSettings,
  adminUpdateSettings,
} from "../../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function AdminSettings() {
  const [settingsData, setSettingsData] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    currency: "",
    taxRate: "",
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dangerLoading, setDangerLoading] = useState({
    clearCache: false,
    resetSettings: false,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const payload = await adminGetSettings();

      if (!payload.success) {
        throw new Error(payload.message || "Failed to load settings");
      }

      setSettingsData({
        storeName: payload.settings?.storeName || "",
        storeEmail: payload.settings?.storeEmail || "",
        storePhone: payload.settings?.storePhone || "",
        currency: payload.settings?.currency || "",
        taxRate: payload.settings?.taxRate || "",
        notificationsEnabled:
          typeof payload.settings?.notificationsEnabled === "boolean"
            ? payload.settings.notificationsEnabled
            : true,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      notifyError(error.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedTaxRate = Number(settingsData.taxRate);
    if (
      !Number.isFinite(parsedTaxRate) ||
      parsedTaxRate < 0 ||
      parsedTaxRate > 100
    ) {
      notifyError("Tax rate must be between 0 and 100");
      return;
    }

    try {
      setSaving(true);
      const payload = await adminUpdateSettings(settingsData);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to save settings");
      }

      notifySuccess("Settings saved successfully.");
    } catch (error) {
      console.error("Error saving settings:", error);
      notifyError(error.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    const shouldProceed = await confirmAction("Clear application cache now?", {
      title: "Clear Cache",
      confirmText: "Clear Cache",
      variant: "danger",
    });

    if (!shouldProceed) return;

    try {
      setDangerLoading((prev) => ({ ...prev, clearCache: true }));
      const payload = await adminClearCache();

      if (!payload.success) {
        throw new Error(payload.message || "Failed to clear cache");
      }

      notifySuccess(payload.message || "Cache cleared.");
    } catch (error) {
      console.error("Error clearing cache:", error);
      notifyError(error.message || "Unable to clear cache");
    } finally {
      setDangerLoading((prev) => ({ ...prev, clearCache: false }));
    }
  };

  const handleResetSettings = async () => {
    const shouldProceed = await confirmAction(
      "Reset store settings back to default values?",
      {
        title: "Reset Settings",
        confirmText: "Reset Settings",
        variant: "danger",
      },
    );

    if (!shouldProceed) return;

    try {
      setDangerLoading((prev) => ({ ...prev, resetSettings: true }));
      const payload = await adminResetSettings();

      if (!payload.success) {
        throw new Error(payload.message || "Failed to reset settings");
      }

      setSettingsData({
        storeName: payload.settings?.storeName || "",
        storeEmail: payload.settings?.storeEmail || "",
        storePhone: payload.settings?.storePhone || "",
        currency: payload.settings?.currency || "",
        taxRate: payload.settings?.taxRate || "",
        notificationsEnabled:
          typeof payload.settings?.notificationsEnabled === "boolean"
            ? payload.settings.notificationsEnabled
            : true,
      });

      notifySuccess(payload.message || "Settings reset to defaults.");
    } catch (error) {
      console.error("Error resetting settings:", error);
      notifyError(error.message || "Unable to reset settings");
    } finally {
      setDangerLoading((prev) => ({ ...prev, resetSettings: false }));
    }
  };

  const settingsSections = [
    {
      title: "Store Information",
      icon: Globe,
      description: "Configure basic store settings",
      color: "text-blue-600",
    },
    {
      title: "Security",
      icon: Lock,
      description: "Manage authentication and permissions",
      color: "text-red-600",
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Configure email and alert settings",
      color: "text-orange-600",
    },
    {
      title: "Admin Users",
      icon: Users,
      description: "Manage admin accounts and roles",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Settings</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        Admin Settings
      </h1>

      {loading && (
        <div className="border border-[#DFDFDF] p-3 mb-4 text-[12px] text-[#0000008C]">
          Loading settings...
        </div>
      )}

      <section className="border border-[#DFDFDF] p-4 mb-6">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Store Information
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            id="storeName"
            name="storeName"
            placeholder="Store Name"
            value={settingsData.storeName}
            onChange={handleChange}
            type="text"
          />

          <Input
            id="storeEmail"
            name="storeEmail"
            placeholder="Store Email"
            value={settingsData.storeEmail}
            onChange={handleChange}
            type="email"
          />

          <Input
            id="storePhone"
            name="storePhone"
            placeholder="Store Phone"
            value={settingsData.storePhone}
            onChange={handleChange}
            type="tel"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              id="currency"
              name="currency"
              placeholder="Currency"
              value={settingsData.currency}
              onChange={handleChange}
              type="text"
            />
            <div>
              <Input
                id="taxRate"
                name="taxRate"
                placeholder="Tax Rate (%)"
                value={settingsData.taxRate}
                onChange={handleChange}
                type="number"
                min="0"
                max="100"
              />
              <p className="text-[11px] text-[#0000008C]">
                Allowed range: 0–100
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-[12px]">
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={settingsData.notificationsEnabled}
              onChange={handleChange}
            />
            Enable email/alert notifications
          </label>

          <Button
            className="w-full"
            value={saving ? "Saving..." : "Save Settings"}
            showArrow={!saving}
          />
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {settingsSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div
              key={section.title}
              className="border border-[#DFDFDF] p-4 flex items-start gap-3 hover:bg-gray-50 transition cursor-pointer"
            >
              <IconComponent className={`${section.color} mt-1`} size={24} />
              <div>
                <h3 className="text-[14px] font-medium uppercase">
                  {section.title}
                </h3>
                <p className="text-[12px] text-[#0000008C] mt-1">
                  {section.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Danger Zone
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200">
            <div>
              <h3 className="text-[12px] font-medium uppercase">Clear Cache</h3>
              <p className="text-[12px] text-[#0000008C]">
                Remove cached data and refresh runtime cache state
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="bg-red-600 text-white text-[12px] font-medium h-8 px-3"
            >
              {dangerLoading.clearCache ? "Clearing..." : "Clear"}
            </button>
          </div>

          <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200">
            <div>
              <h3 className="text-[12px] font-medium uppercase">
                Reset Settings
              </h3>
              <p className="text-[12px] text-[#0000008C]">
                Reset store settings to default values
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetSettings}
              className="bg-red-600 text-white text-[12px] font-medium h-8 px-3"
            >
              {dangerLoading.resetSettings ? "Resetting..." : "Reset"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
