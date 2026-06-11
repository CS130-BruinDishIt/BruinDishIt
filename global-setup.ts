import { request, expect } from '@playwright/test';

export default async function globalSetup() {
  const api = await request.newContext();

  await expect.poll(async () => {
    try {
      const res = await api.get('http://localhost:3000/api/dining/menus/bruin-cafe');

      if (!res.ok()) return false;

      const json = await res.json();
      return json.hallSlug === "bruin-cafe";
    } catch {
      return false;
    }
  }, {
    timeout: 300000,
    intervals: [1000, 2000, 5000],
  }).toBe(true);

  await api.dispose();
}