const fs = require("fs/promises");
const path = require("path");

const SETTINGS_FILE_PATH = path.join(
  __dirname,
  "..",
  "data",
  "admin-settings.json",
);

const DEFAULT_SETTINGS = {
  storeName: "Makam Fashion",
  storeEmail: "admin@makam.com",
  storePhone: "+234 800 000 0000",
  currency: "NGN",
  taxRate: "7.5",
  notificationsEnabled: true,
};

const ensureSettingsFile = async () => {
  const directory = path.dirname(SETTINGS_FILE_PATH);
  await fs.mkdir(directory, { recursive: true });

  try {
    await fs.access(SETTINGS_FILE_PATH);
  } catch {
    await fs.writeFile(
      SETTINGS_FILE_PATH,
      JSON.stringify(DEFAULT_SETTINGS, null, 2),
      "utf-8",
    );
  }
};

const readSettings = async () => {
  await ensureSettingsFile();
  const raw = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return { ...DEFAULT_SETTINGS, ...parsed };
};

const writeSettings = async (settings) => {
  await ensureSettingsFile();
  await fs.writeFile(
    SETTINGS_FILE_PATH,
    JSON.stringify(settings, null, 2),
    "utf-8",
  );
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await readSettings();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const current = await readSettings();
    const {
      storeName,
      storeEmail,
      storePhone,
      currency,
      taxRate,
      notificationsEnabled,
    } = req.body;

    if (taxRate !== undefined) {
      const parsedTaxRate = Number(taxRate);
      if (
        !Number.isFinite(parsedTaxRate) ||
        parsedTaxRate < 0 ||
        parsedTaxRate > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Tax rate must be a number between 0 and 100",
        });
      }
    }

    const nextSettings = {
      ...current,
      ...(storeName !== undefined
        ? { storeName: String(storeName).trim() }
        : {}),
      ...(storeEmail !== undefined
        ? { storeEmail: String(storeEmail).trim() }
        : {}),
      ...(storePhone !== undefined
        ? { storePhone: String(storePhone).trim() }
        : {}),
      ...(currency !== undefined
        ? { currency: String(currency).trim().toUpperCase() }
        : {}),
      ...(taxRate !== undefined ? { taxRate: String(Number(taxRate)) } : {}),
      ...(typeof notificationsEnabled === "boolean"
        ? { notificationsEnabled }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    await writeSettings(nextSettings);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: nextSettings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.clearCache = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Cache clear request completed",
      details: {
        clearedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.resetSettings = async (req, res) => {
  try {
    await writeSettings({
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString(),
    });
    res.status(200).json({
      success: true,
      message: "Settings reset to defaults",
      settings: await readSettings(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
