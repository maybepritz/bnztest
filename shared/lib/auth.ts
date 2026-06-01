import { cookies } from "next/headers";

export async function getServerUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  
  if (!userCookie || !userCookie.value) {
    return null;
  }

  const tokenCookie = cookieStore.get("token");

  try {
    const user = JSON.parse(decodeURIComponent(userCookie.value));
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
        role: user.role,
      },
      token: tokenCookie?.value
    };
  } catch (e) {
    return null;
  }
}
