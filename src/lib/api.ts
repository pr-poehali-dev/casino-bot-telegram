const URLS = {
  auth: "https://functions.poehali.dev/37c23201-4f0d-4d2b-97da-a540a5c0ba0a",
  deposit: "https://functions.poehali.dev/7d849fd5-b871-4ef0-961e-a1e1b27f91fb",
  profile: "https://functions.poehali.dev/b865142b-0e55-4813-8ed6-ec9751e2bc8a",
};

export async function authUser(initData: string, referredBy?: string) {
  const res = await fetch(URLS.auth, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, referredBy }),
  });
  return res.json();
}

export async function createInvoice(user_id: number, pkg: number) {
  const res = await fetch(URLS.deposit, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, package: pkg }),
  });
  return res.json();
}

export async function checkInvoice(user_id: number, invoice_id: string) {
  const res = await fetch(`${URLS.deposit}/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, invoice_id }),
  });
  return res.json();
}

export async function getProfile(user_id: number) {
  const res = await fetch(`${URLS.profile}?user_id=${user_id}`);
  return res.json();
}
