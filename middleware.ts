import { NextResponse } from "next/server";
import { auth } from "./auth";

// api, _next/static, _next/image, favicon.ico以外のアクセスであればmiddlewareを通すという意味です。
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  // ユーザーが認証済みか判断し、認証済みでなければサインインページにリダイレクトします。
  const { nextUrl } = req;

  // ユーザーが未認証で、現在のページが "/signin" ではない場合
  if (!req.auth && nextUrl.pathname !== "/signin") {
    const signinUrl = new URL("/signin", nextUrl.origin);
    signinUrl.searchParams.set("callbackUrl", nextUrl.pathname); // 遷移先のURLを保存

    return NextResponse.redirect(signinUrl);
  }
});