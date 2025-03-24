"use client";

import * as React from "react"
import { Button } from "@/components/ui/Button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { signIn } from "next-auth/react";

export default function SignInCard() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">

      <Card className="w-[360px] h-auto pt-2">
        <CardHeader>
          <CardTitle className="text-2xl text-center border-b pb-3">Flash-learn</CardTitle>
          <CardTitle className="text-xl pt-2 text-center">ログイン</CardTitle>
          <CardDescription className="text-center">新規登録またはログインの方法をお選びください。</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            className="w-full bg-gray-900 hover:bg-gray-700"
            onClick={() => {
              signIn("cognito", { callbackUrl: "/groups" })
            }
            }
          >
            メールアドレス
          </Button>
          <Button
            className="w-full bg-gray-900 hover:bg-gray-700"
            onClick={() => {
              signIn("google", { callbackUrl: "/groups" })
            }
            }
          >
            Google
          </Button>
        </CardFooter>
      </Card>
      
    </div>
  )
}
