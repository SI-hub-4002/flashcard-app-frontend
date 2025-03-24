"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Plus, PenLine, Bookmark, BookmarkCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { useParams } from "next/navigation"
import { ConfirmationModal } from "@/components/ui/Modal"

interface FlashcardData {
  flashcardId: string,
  front_text: string,
  back_text: string,
  detail: string,
  bookmarked: boolean
}
interface NotebookData {
  title: string,
  description: string,
  flashcards: number,
  liked: boolean
}

export default function ShowFlashcardsPage() {
  const { groupId, notebookId } = useParams();

  // 取得した全ての単語カード情報を配列で管理
  const [flashcardsData, setFlashcardsData] = useState<FlashcardData[] | null>(null);

  // 取得した単語帳情報をオブジェクトで管理
  const [notebookData, setNotebookData] = useState<NotebookData>({
    title: "",
    description: "",
    flashcards: 0,
    liked: false
  });

  // モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 選択されたカードのIDを管理
  const [selectedFlashcardId, setSelectedFlashcardId] = useState<string | null>(null);

  const [error, setError] = useState<string>("");

  // 特定の単語帳に結びつく単語カード情報を一括取得する処理
  useEffect(() => {
    const fetchFlashcardData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/flashcards?notebookId=${notebookId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setFlashcardsData(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchFlashcardData();
  }, [notebookId]);

  // 特定の単語帳情報を取得する処理
  useEffect(() => {
    const fetchNotebookData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notebooks/${notebookId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setNotebookData(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchNotebookData();
  }, [notebookId]);

  if (error) {
    return <div>error: {error}</div>;
  }

  if (!groupId || !notebookId) {
    return <div>Loading...</div>
  }

  // 単語カードのブックマークの状態の更新処理
  const handleBookmarked = async (bookmarked: boolean, flashcardId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/flashcards/${flashcardId}`, {

        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookmarked: bookmarked }),
      });

      if (!response.ok) {
        throw new Error("単語カード情報の更新に失敗しました");
      }

      setFlashcardsData(prevFlashcards =>
        prevFlashcards ? prevFlashcards.map(flashcard =>
          flashcard.flashcardId === flashcardId
            ? { ...flashcard, bookmarked }
            : flashcard
        ) : prevFlashcards
      );

    } catch (error) {
      console.log(error);
    }
  }

  // 単語カードの削除処理
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/flashcards/${selectedFlashcardId}`, {

        method: "DELETE",

      });

      if (!response.ok) {
        throw new Error("単語カード情報の削除に失敗しました");
      }

      setFlashcardsData((prevFlashcards) =>
        prevFlashcards
          ? prevFlashcards.filter(
            (flashcard) => flashcard.flashcardId !== selectedFlashcardId
          )
          : prevFlashcards
      );

      setIsModalOpen(false);

    } catch (error) {
      console.log(error);
    }
  }

  // 削除処理の二段階確認用モーダル
  const openDeleteModal = (flashcardId: string) => {
    setSelectedFlashcardId(flashcardId);
    setIsModalOpen(true);
  };

  return (
    <div className="container w-[90%] mx-auto px-4 py-6">

      <div className="mb-8 flex flex-col gap-4 md:flex-row items-center justify-between">
        <div className="flex items-center gap-3 mr-10">
          <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">{notebookData.title}</h1>
            <div className="mt-2 flex items-center justify-center md:justify-start">

              {/* 単語帳情報が取得できるまでは何も表示しない */}
              {flashcardsData === null ? (
                <></>
              ) : (
                <span className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="mr-1 h-4 w-4" />
                  {notebookData.flashcards} flashcards
                </span>
              )}

            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/groups/${groupId}/notebooks/${notebookId}/flashcard-create`}>
              <Plus className="mr-2 h-4 w-4" />
              単語カードを追加
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={`/groups/${groupId}/notebooks/${notebookId}/learn`}
            >
              学習開始
            </Link>
          </Button>
        </div>
      </div>

      {/* 単語カードの情報が取得できるまでは何も表示せず、そもそも単語帳カードの情報がない場合はその旨を表示する */}
      {flashcardsData === null ? (
        <></>
      ) : flashcardsData.length > 0 ? (
        <div className="space-y-3">
          {flashcardsData.map((flashcard) => (
            <Card key={flashcard.flashcardId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{flashcard.front_text}</h3>
                    <p className="text-sm text-muted-foreground">{flashcard.back_text}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {flashcard.detail && (
                        <span className="p-1 bg-slate-100 rounded-md text-xs font-bold">詳細説明あり</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { handleBookmarked(!flashcard.bookmarked, flashcard.flashcardId) }}
                      className={flashcard.bookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}
                    >
                      {flashcard.bookmarked ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/groups/${groupId}/notebooks/${notebookId}/flashcards/${flashcard.flashcardId}/flashcard-edit`}>
                        <PenLine className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(flashcard.flashcardId)}>
                      <div>
                        <Trash2 className="h-4 w-4" />
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[50vh] w-full">
          <p className="text-center text-muted-foreground text-lg">新しい単語カードを作成しましょう！</p>
        </div>
      )}


      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        message="この単語カードを削除してもよろしいですか？"
      />

    </div>
  )
}
