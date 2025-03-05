import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(os.homedir(), ".currcalc");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create config directory:", error);
  }
}

export async function getApiKey(): Promise<string> {
  if (process.env.CURR_API_KEY) {
    return process.env.CURR_API_KEY;
  }

  try {
    const envPath = path.resolve(__dirname, "../../src/.env");
    config({ path: envPath });
    if (process.env.CURR_API_KEY) {
      return process.env.CURR_API_KEY;
    }
  } catch (error) {}

  try {
    await ensureConfigDir();
    const configData = await fs.readFile(CONFIG_FILE, "utf8");
    const config = JSON.parse(configData);
    return config.apiKey || "";
  } catch (error) {
    return "";
  }
}

export async function saveApiKey(apiKey: string): Promise<void> {
  await ensureConfigDir();

  const config = { apiKey };
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

  try {
    const envPath = path.resolve(__dirname, "../../src/.env");
    await fs.writeFile(envPath, `CURR_API_KEY=${apiKey}\n`);
  } catch (error) {}
}

export async function validateApiKey(): Promise<boolean> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    return false;
  }

  try {
    const response = await axios.get(
      "https://api.apilayer.com/exchangerates_data/symbols",
      {
        headers: {
          apikey: apiKey,
        },
      }
    );

    return response.data.success === true;
  } catch (error) {
    return false;
  }
}
