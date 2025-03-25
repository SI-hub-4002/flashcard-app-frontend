"use client"

import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { ArrowLeft, BookOpen, Heart, PenLine, Save } from "lucide-react"
import { useParams } from "next/navigation"

interface GroupData {
  groupId: string;
  groupname: string;
  description: string;
  notebooks: number;
  flashcards: number;
}

export default function EditGroupPage() {
  const { groupId, notebookId } = useParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 取得した単語帳グループ情報を管理
  const [groupData, setGroupData] = useState<GroupData>();

  // 入力されたタイトルの管理
  const [title, setTitle] = useState("")

  // 入力された説明書きの管理
  const [description, setDescription] = useState("")

  // いいねボタンの状態管理
  const [isliked, setIsLiked] = useState(false)

  // CreateタブとPreviewタブの表示状況を管理
  const [activeTab, setActiveTab] = useState("create")

  const [error, setError] = useState<string>("");

  // 変更する単語帳情報の保存処理
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("タイトルを入力してください", { position: "bottom-left" });
      return;
    }

    if (!description.trim()) {
      toast.error("説明を入力してください", { position: "bottom-left" });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notebooks/${notebookId}`, {

        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupId, title: title, description: description }),

      });

      if (!response.ok) {
        throw new Error("グループの作成に失敗しました");
      }

      setActiveTab("create");
      toast.success("Created!", { position: "bottom-left", autoClose: 2000 });
    } catch (error) {
      toast.error("エラーが発生しました", { position: "bottom-left" })
      console.log(error);
    }
  };

  // IDを指定して特定の単語帳情報を取得する処理
  useEffect(() => {
    const fetchNotebookData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notebooks/${notebookId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setTitle(result.title);
        setDescription(result.description);
        setIsLiked(result.liked);

        setGroupData(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchNotebookData();
  }, [API_URL, notebookId]);

  if (error) {
    return <div>error: {error}</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">

      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`} className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-6 w-6" />
        </Link>
        <div className="mb-6 w-full">
          <h1 className="text-center mr-10 md:mr-0 md:text-left text-2xl font-bold tracking-tight">単語帳の編集</h1>
          <p className="text-center mr-10 md:mr-0 md:text-left text-muted-foreground">既存の単語帳を編集しましょう！</p>
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
                value={title}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語帳のタイトルとして表示されます</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-center md:text-left">説明</Label>
              <Textarea
                id="description"
                placeholder="簡単な説明を入力してください..."
                rows={2}
                value={description}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語帳の説明書きとして表示されます</p>
            </div>
            <div className="flex items-center w-3/4 md:w-auto mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isliked)}
              >
                {isliked ? (
                  <Heart className="h-5 w-5 mt-1 text-red-500 fill-red-500" />
                ) : (
                  <Heart className="h-5 w-5 mt-1" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="py-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-center md:text-left">サンプル</h2>
            <p className="text-sm text-muted-foreground text-center md:text-left">単語帳一覧には次のように表示されます</p>
          </div>         
          <div className="mt-12 mb-2 mx-auto max-w-md">
            <Card className="h-full transition-all hover:shadow-md mr-4 ml-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex justify-start items-center gap-4 m-2 ml-1">
                      <CardTitle>{title}</CardTitle>
                      <PenLine className="h-4 w-4" />
                    </div>
                    <CardDescription>{description}</CardDescription>
                  </div>
                  {isliked ? (
                    <Heart className="h-4 w-4 mt-2 text-red-500 fill-red-500" />
                  ) : (
                    <Heart className="h-4 w-4 mt-2" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="mr-1 h-4 w-4" />
                  <span>{groupData?.flashcards} flashcards</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-center md:justify-end">
        <ToastContainer />
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          単語帳を保存する
        </Button>
      </div>

    </div>
  )
}
