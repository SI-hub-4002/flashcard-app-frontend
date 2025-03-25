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
import { ArrowLeft, BookOpen, FolderOpen, PenLine, Save } from "lucide-react"
import { useParams } from "next/navigation"

interface GroupData {
  groupId: string;
  groupname: string;
  description: string;
  notebooks: number;
  flashcards: number;
}

export default function EditGroupPage() {
  const { groupId } = useParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 取得した単語帳グループを管理
  const [groupData, setGroupData] = useState<GroupData>();

  // 入力されたグループ名の管理
  const [groupname, setGroupname] = useState("");

  // 入力された説明書きを管理
  const [description, setDescription] = useState("");

  // CreateタブとPreviewタブの表示状況を管理
  const [activeTab, setActiveTab] = useState("create");

  const [error, setError] = useState<string>("");
  
  //編集する単語帳グループ情報の保存処理
  const handleSave = async () => {
    if (!groupname.trim()) {
      toast.error("グループ名を入力してください", { position: "bottom-left" });
      return;
    }
    if (!description.trim()) {
      toast.error("説明を入力してください", { position: "bottom-left" });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/groups/${groupId}`, {

        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupname: groupname, description: description }),
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

  // IDを指定して特定の単語帳グループを取得する処理
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/groups/${groupId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setGroupname(result.groupname);
        setDescription(result.description);

        setGroupData(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchGroupData();
  }, [API_URL, groupId]);

  if (error) {
    return <div>error: {error}</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">

      <div className="flex items-center gap-3">
        <Link href="/groups" className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-6 w-6" />
        </Link>
        <div className="mb-6 w-full">
          <h1 className="text-center mr-10 md:mr-0 md:text-left text-2xl font-bold tracking-tight">単語帳グループの編集</h1>
          <p className="text-center mr-10 md:mr-0 md:text-left text-muted-foreground">既存の単語帳グループを編集しましょう！</p>
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
              <Label htmlFor="groupname" className="text-center md:text-left">グループ名</Label>
              <Input
                id="groupname"
                placeholder="グループ名を入力してください..."
                value={groupname}
                className="w-3/4 md:w-full mx-auto placeholder:text-sm"
                onChange={(e) => setGroupname(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center md:text-left">単語帳グループの名前として表示されます</p>
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
                  <CardTitle>{groupname || "TOEIC英単語"}</CardTitle>
                  <PenLine className="h-4 w-4" />
                </div>
                <CardDescription>{description || "TOEICの頻出重要単語集"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FolderOpen className="mr-1 h-4 w-4" />
                  <span className="mr-4">{groupData?.notebooks} notebooks</span>
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
          単語帳グループを保存する
        </Button>
      </div>
      
    </div>
  )
}
