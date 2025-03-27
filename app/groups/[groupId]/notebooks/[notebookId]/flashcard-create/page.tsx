"use client"

import { toast, ToastContainer } from "react-toastify";
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Book, Save, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet"
import { Separator } from "@/components/ui/Separator"
import { useParams } from "next/navigation"

export default function CreateFlashcardPage() {
  const { groupId, notebookId } = useParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 入力された表側テキストの管理
  const [frontText, setFrontText] = useState("")

  // 入力された裏側テキストの管理
  const [backText, setBackText] = useState("")

  // 入力された詳細内容の管理
  const [detail, setDetail] = useState("")

  // CreateタブとPreviewタブの表示状況を管理
  const [activeTab, setActiveTab] = useState("create")

  // ブックマークの状態管理
  const [isBookmarked, setIsBookmarked] = useState(false)

  // 構文をJSXに変換
  const formatNotes = (detail: string) => {
    if (!detail) return null;

    // 太文字
    const boldFormatted = detail.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 改行
    const lineBreaksFormatted = boldFormatted.replace(/\n/g, "<br/>");

    // 空白
    const listFormatted = lineBreaksFormatted.replace(/- (.*?)(?=\n|$)/g, "• $1");

    return <div dangerouslySetInnerHTML={{ __html: listFormatted }} />;
  };

  // 新しく作成する単語カード情報の保存処理
  const handleCreate = async () => {
    if (!frontText.trim()) {
      toast.error("表のテキストを入力してください", { position: "bottom-left" });
      return;
    }

    if (!frontText.trim()) {
      toast.error("裏のテキストを入力してください", { position: "bottom-left" });
      return;
    }

    // エスケープ処理
    const escapeHtml = (str: string) => {
      return str.replace(/[&<>"']/g, (match) => {
        const escapeMap: { [key: string]: string } = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };
        return escapeMap[match];
      });
    };

    const escapedDetail = escapeHtml(detail);

    try {
      const response = await fetch(`${API_URL}/api/flashcards?notebookId=${notebookId}`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ front_text: frontText, back_text: backText, detail: escapedDetail, bookmarked: isBookmarked }),
      });

      if (!response.ok) {
        throw new Error("グループの作成に失敗しました");
      }

      // 保存後にテキストボックスリセット
      setFrontText("");
      setBackText("");
      setDetail("");
      setIsBookmarked(false);
      setActiveTab("create");
      toast.success("Created!", { position: "bottom-left", autoClose: 2000 });
    } catch (error) {
      toast.error("エラーが発生しました", { position: "bottom-left" })
      console.log(error);
    }
  };


  if (!groupId || !notebookId) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">

      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}/notebooks/${notebookId}`} className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-6 w-6" />
        </Link>
        <div className="mb-6 w-full">
          <h1 className="text-center mr-10 md:mr-0 md:text-left text-2xl font-bold tracking-tight">単語カードの新規作成</h1>
          <p className="text-center mr-10 md:mr-0 md:text-left text-muted-foreground">新しい単語カードを追加しましょう！</p>
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
              <Label htmlFor="word" className="text-center md:text-left">表面</Label>
              <Input
                id="word"
                placeholder="単語を入力してください..."
                value={frontText}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setFrontText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語カードの表面に表示されます</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="definition" className="text-center md:text-left">裏面</Label>
              <Textarea
                id="definition"
                placeholder="簡単な説明を入力してください..."
                rows={2}
                value={backText}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setBackText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語カードの裏面に表示されます</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-center md:text-left">詳細説明</Label>
              <Textarea
                id="notes"
                placeholder="例文、語法などの詳細な説明を入力してください..."
                rows={10}
                value={detail}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setDetail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">
                単語カード裏面の「詳細を確認」から閲覧することが可能です
              </p>
            </div>

            <div className="flex items-center w-3/4 md:w-auto mx-auto">
              <Button
                variant="ghost"
                size="sm"
                className={isBookmarked ? "text-yellow-500" : "text-muted-foreground"}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmark
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="py-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-center md:text-left">サンプル</h2>
            <p className="text-sm text-muted-foreground text-center md:text-left">学習中は次のように表示されます</p>
          </div>

          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <h3 className="mb-2 text-sm font-medium text-center md:text-left">表面</h3>
              <Card className="ml-4 mr-4">
                <CardContent className="flex h-40 md:h-48 flex-col items-center justify-center p-6">
                  <h2 className="text-center text-3xl font-bold">{frontText || "allow"}</h2>
                  <p className="mt-4 text-center text-sm text-muted-foreground">クリックして裏面を表示</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <h3 className="mb-2 text-sm font-medium text-center md:text-left">裏面</h3>
              <Card className="ml-4 mr-4">
                <CardContent className="relative flex h-40 md:h-48 flex-col items-center justify-between p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-center text-xl">{backText || "許可する"}</p>
                  </div>

                  <div className="flex w-3/4 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={isBookmarked ? "absolute text-yellow-500 top-2 right-2" : "absolute text-muted-foreground top-2 right-2"}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </Button>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="mt-4" size="sm">
                          <Book className="mr-2 h-4 w-4" />
                          詳細を確認
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>{frontText || "allow"}</SheetTitle>
                          <SheetDescription>{backText || "許可する"}</SheetDescription>
                        </SheetHeader>
                        <Separator className="my-4" />
                        <div className="prose prose-sm mt-4 text-muted-foreground">
                          {detail ? formatNotes(detail) : (
                            <div dangerouslySetInnerHTML={{ __html: "例文）<br />&nbsp;&nbsp;&nbsp;I cannot allow such conduct.<br />&nbsp;&nbsp;&nbsp;そのような行為を許すわけにはいかない<br /><br />&nbsp;&nbsp;&nbsp;Customers are not allowed behind the counter<br />&nbsp;&nbsp;&nbsp;お客様はカウンターの後ろには入れません" }} />)}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center md:justify-end">
        <ToastContainer />
        <Button onClick={handleCreate}>
          <Save className="mr-2 h-4 w-4" />
          単語カードを保存する
        </Button>
      </div>

    </div>
  )
}
