"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Heart, PenLine, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { ConfirmationModal } from "@/components/ui/Modal"

interface NotebookData {
  notebookId: string,
  groupId: string,
  title: string,
  description: string,
  flashcards: number,
  liked: boolean
}

interface GroupData {
  groupname: string
}

export default function ShowLikedNotebooksPage() {

  // 取得した全ての単語帳情報を配列で管理
  const [notebooksData, setNotebooksData] = useState<NotebookData[] | null>(null);

  // 単語帳とその所属グループのペアを辞書で管理
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});

  // モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 選択された英単語帳のIDを管理
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const [error, setError] = useState<string>("");

  // いいね登録されている全ての単語帳情報を一括取得する処理
  useEffect(() => {
    const fetchNotebooksData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notebooks/liked`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setNotebooksData(result);

        const groupIds = result.map((notebook: NotebookData) => notebook.groupId);
        const groupNamesMap: Record<string, string> = {};

        for (const groupId of groupIds) {
          const groupResponse = await fetch(`http://localhost:8080/api/groups/${groupId}`);
          if (groupResponse.ok) {
            const groupData: GroupData = await groupResponse.json();
            groupNamesMap[groupId] = groupData.groupname;
          }
        }
        setGroupNames(groupNamesMap);

      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchNotebooksData();
  }, []);

  if (error) {
    return <div>error: {error}</div>;
  }

  // いいねボタンの状態の更新処理
  const handleLiked = async (notebookId: string, liked: boolean) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notebooks/${notebookId}`, {

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
      const response = await fetch(`http://localhost:8080/api/notebooks/${selectedNotebookId}`, {

        method: "DELETE",

      });

      if (!response.ok) {
        throw new Error("単語帳情報の削除に失敗しました");
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

      <div className="flex items-center gap-3 w-full">
        <Link href="/groups" className="mb-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-6 w-6" />
        </Link>
        <div className="mb-8 w-full">
          <h1 className="text-2xl font-bold tracking-tight text-center md:text-left mr-7 md:mr-0">お気に入りの単語帳</h1>
          <p className="text-muted-foreground text-center md:text-left mr-7 md:mr-0">あなたのお気に入りの単語帳の一覧です！</p>
        </div>
      </div>

      {/* 単語帳情報が取得できるまでは何も表示せず、そもそも単語帳情報がない場合はその旨を表示する */}
      {notebooksData === null ? (
        <></>
      ) : notebooksData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notebooksData.map((notebook) => {
            const groupName = groupNames[notebook.groupId] || null;
            return (
              <div key={notebook.notebookId} className="block">
                <Card className="h-full transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex justify-start items-center gap-4">
                          <Link href={`/groups/${notebook.groupId}/notebooks/${notebook.notebookId}`}>
                            <CardTitle>{notebook.title}</CardTitle>
                          </Link>
                          <div className="flex justify-start items-center gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/groups/${notebook.groupId}/notebooks/${notebook.notebookId}/notebook-edit`}>
                                <PenLine className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteModal(notebook.notebookId)}>
                              <div>
                                <Trash2 className="h-4 w-4" />
                              </div>
                            </Button>
                          </div>
                        </div>
                        <Link href={`/groups/${notebook.groupId}/notebooks/${notebook.notebookId}`}>
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
                  <Link href={`/groups/${notebook.groupId}/notebooks/${notebook.notebookId}`}>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="mr-1 h-4 w-4" />
                        <span>{notebook.flashcards} flashcards</span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="p-1 bg-slate-100 rounded-md text-xs font-bold">{groupName}</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[50vh] w-full">
          <p className="text-center text-muted-foreground text-lg">単語帳をお気に入り登録しましょう！</p>
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