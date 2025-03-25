"use client"

import { toast, ToastContainer } from "react-toastify";
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { ArrowLeft, BookOpen, FolderOpen, PenLine, Save } from "lucide-react"

export default function CreateGroupPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 入力されたグループ名の管理
  const [groupname, setGroupname] = useState("")

  // 入力された説明書きの管理
  const [definition, setDefinition] = useState("")

  // CreateタブとPreviewタブの表示状況を管理
  const [activeTab, setActiveTab] = useState("create")

  // 新しく作成する単語帳グループ情報の保存処理
  const handleCreate = async () => {
    if (!groupname.trim()) {
      toast.error("タイトルを入力してください", { position: "bottom-left" });
      return;
    }

    if (!definition.trim()) {
      toast.error("説明を入力してください", { position: "bottom-left" });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/groups`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sub: "d2b87621-23d7-4c8b-bcc6-1b9e3e1323f7", groupname: groupname, description: definition }),
      });

      if (!response.ok) {
        throw new Error("グループの作成に失敗しました");
      }

      setGroupname("");
      setDefinition("");
      setActiveTab("create");
      toast.success("Created!", { position: "bottom-left", autoClose: 2000 });
    } catch (error) {
      toast.error("エラーが発生しました", { position: "bottom-left" })
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">

      <div className="flex items-center gap-3">
        <Link href="/groups" className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-6 w-6" />
        </Link>
        <div className="mb-6 w-full">
          <h1 className="text-center mr-10 md:mr-0 md:text-left text-2xl font-bold tracking-tight">単語帳グループの新規作成</h1>
          <p className="text-center mr-10 md:mr-0 md:text-left text-muted-foreground">新しい単語帳グループを作成しましょう！</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-3/4 md:w-full grid-cols-2 mx-auto">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="groupname" className="text-center md:text-left">タイトル</Label>
              <Input
                id="groupname"
                placeholder="タイトルを入力してください..."
                value={groupname}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setGroupname(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語帳グループのタイトルとしてのタイトルとして表示されます</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="definition" className="text-center md:text-left">説明</Label>
              <Textarea
                id="definition"
                placeholder="簡単な説明を入力してください..."
                rows={2}
                value={definition}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setDefinition(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語帳グループの説明書きとして表示されます</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="py-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-center md:text-left">サンプル</h2>
            <p className="text-sm text-muted-foreground text-center md:text-left">単語帳グループ一覧には次のように表示されます</p>
          </div>
          <div className="mt-12 mb-2 mx-auto max-w-md">
            <Card className="h-full transition-all hover:shadow-md mr-4 ml-4">
              <CardHeader>
                <div className="flex justify-start items-center gap-4">
                  <CardTitle>{groupname || "例）English"}</CardTitle>
                  <PenLine className="h-4 w-4" />
                </div>
                <CardDescription>{definition || "例）様々な種類の英単語帳"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FolderOpen className="mr-1 h-4 w-4" />
                  <span className="mr-4">0 notebooks</span>
                  <BookOpen className="mr-1 h-4 w-4" />
                  <span>0 flashcards</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-center md:justify-end">
        <ToastContainer/>
        <Button onClick={handleCreate}>
          <Save className="mr-2 h-4 w-4"/>
          単語帳グループを保存する
        </Button>
      </div>

    </div>
  )
}
