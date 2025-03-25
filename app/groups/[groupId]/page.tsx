"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, Heart, PenLine, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ConfirmationModal } from "@/components/ui/Modal"

interface GroupData {
  groupname: string,
  description: string,
}

interface NotebookData {
  notebookId: string,
  title: string,
  description: string,
  flashcards: number,
  liked: boolean
}

export default function ShowNotebooksPage() {
  const { groupId } = useParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 取得した単語帳グループ情報をオブジェクトで管理
  const [groupData, setGroupData] = useState<GroupData>({
    groupname: "",
    description: "",
  });

  // 取得した全ての単語帳情報を配列で管理
  const [notebooksData, setNotebooksData] = useState<NotebookData[] | null>(null);

  //　モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  //　選択された単語帳のIDを管理
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const [error, setError] = useState<string>("");

  // 特定の単語帳グループ情報を取得する処理
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/groups/${groupId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
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

  // 特定の単語帳グループに結びつく単語帳情報を一括取得する処理
  useEffect(() => {
    const fetchNotebooksData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notebooks?groupId=${groupId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setNotebooksData(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchNotebooksData();
  }, [API_URL, groupId]);

  if (error) {
    return <div>error: {error}</div>;
  }

  // 単語帳グループのいいねボタンの状態の更新処理
  const handleLiked = async (notebookId: string, liked: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/notebooks/${notebookId}`, {

        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ liked: liked }),
      });

      if (!response.ok) {
        throw new Error("単語カード情報の更新に失敗しました");
      }

      setNotebooksData(prevNotebooks =>
        prevNotebooks ? prevNotebooks.map(notebook =>
          notebook.notebookId === notebookId
            ? { ...notebook, liked }
            : notebook
        ) : prevNotebooks
      );

    } catch (error) {
      console.log(error);
    }
  }

  // 単語帳の削除処理
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notebooks/${selectedNotebookId}`, {

        method: "DELETE",

      });

      if (!response.ok) {
        throw new Error("単語カード情報の削除に失敗しました");
      }

      setNotebooksData((prevNotebooks) =>
        prevNotebooks
          ? prevNotebooks.filter(
            (notebook) => notebook.notebookId !== selectedNotebookId
          )
          : prevNotebooks
      );

      setIsModalOpen(false);

    } catch (error) {
      console.log(error);
    }
  }

  // 削除処理の二段階確認用モーダル
  const openDeleteModal = (flashcardId: string) => {
    setSelectedNotebookId(flashcardId);
    setIsModalOpen(true);
  };

  return (
    <div className="container w-[90%] mx-auto px-4 py-6">

      <div className="mb-8 flex flex-col gap-4 md:flex-row items-center justify-between">
        <div className="flex items-center gap-3 mr-10">
          <Link href="/groups" className="text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">{groupData.groupname}</h1>
            <p className="text-muted-foreground text-center md:text-left">{groupData.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/liked-notebooks">
              <Heart className="mr-2 h-4 w-4 text-red-500 fill-red-500" />
              お気に入りの単語帳
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/groups/${groupId}/notebook-create`} className="flex justify-center items-center">
              <Plus className="mr-2 h-4 w-4" />
              新しい単語帳の作成
            </Link>
          </Button>
        </div>
      </div>

      {/* 単語帳情報が取得できるまでは何も表示せず、そもそも単語帳情報がない場合はその旨を表示する */}
      {notebooksData === null ? (
        <></>
      ) : notebooksData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notebooksData.map((notebook) => (
            <div key={notebook.notebookId} className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex justify-start items-center gap-4">
                        <Link href={`/groups/${groupId}/notebooks/${notebook.notebookId}`}>
                          <CardTitle>{notebook.title}</CardTitle>
                        </Link>
                        <div className="flex justify-start items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/groups/${groupId}/notebooks/${notebook.notebookId}/notebook-edit`}>
                              <PenLine className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteModal(notebook.notebookId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Link href={`/groups/${groupId}/notebooks/${notebook.notebookId}`}>
                        <CardDescription>{notebook.description}</CardDescription>
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { handleLiked(notebook.notebookId, !notebook.liked) }}
                    >
                      {notebook.liked ? (
                        <Heart className="h-5 w-5 mt-1 text-red-500 fill-red-500" />
                      ) : (
                        <Heart className="h-5 w-5 mt-1" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <Link href={`/groups/${groupId}/notebooks/${notebook.notebookId}`}>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="mr-1 h-4 w-4" />
                      <span>{notebook.flashcards} flashcards</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[50vh] w-full">
          <p className="text-center text-muted-foreground text-lg">新しい単語帳を作成しましょう！</p>
        </div>
      )}



      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        message="この単語帳を削除してもよろしいですか？"
      />

    </div>
  )
}

