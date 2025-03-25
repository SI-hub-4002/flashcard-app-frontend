"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Book, ChevronLeft, ChevronRight, X, Bookmark, BookmarkCheck, Circle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet"
import { Separator } from "@/components/ui/Separator"
import { Switch } from "@/components/ui/Switch"
import { Label } from "@/components/ui/Label"

interface FlashcardData {
  flashcardId: string,
  front_text: string,
  back_text: string,
  detail: string,
  bookmarked: boolean
}

interface NotebookData {
  notebookId: string,
  title: string,
  description: string,
  flashcards: number,
  liked: boolean
}

export default function LearnPage() {
  const { groupId, notebookId } = useParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 取得した全ての単語カード情報を配列で管理
  const [flashcards, setFlashcards] = useState<FlashcardData[] | null>(null);

  // 取得してきた、bookmarkedがtrueの単語カード情報を配列で管理
  const [bookmarkedFlashcards, setBookmarkedFlashcards] = useState<FlashcardData[] | null>(null)

  // 現在扱う英単語カード配列がflashcardsかbookmarkedFlashcardsかを管理
  const [useFlashcards, setUseFlashcards] = useState<FlashcardData[] | null>(null)

  // 取得した特定の単語帳をオブジェクトで管理
  const [notebook, setNotebook] = useState<NotebookData>({
    notebookId: "",
    title: "",
    description: "",
    flashcards: 0,
    liked: false
  });

  // 表示する単語カードのインデックスを管理
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)

  // 表示する単語カードの表裏の状態を管理
  const [isFlipped, setIsFlipped] = useState(false)

  // 単語カードの正解不正解を管理
  const [knownFlashcards, setKnownFlashcards] = useState<string[]>([])
  const [bookmarkedKnownFlashcards, setBookmarkedKnownFlashcards] = useState<string[]>([])
  const [unknownFlashcards, setUnknownFlashcards] = useState<string[]>([])

  // ブックマークのみモードの状態管理
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  // 詳細内容の開閉状態を管理
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [error, setError] = useState<string>("");

  // 特定の単語帳に結びつく全ての単語カードを一括取得する処理
  useEffect(() => {
    const fetchNotebooksData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/flashcards?notebookId=${notebookId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setFlashcards(result)
        setBookmarkedFlashcards(result.filter((flashcard: FlashcardData) => flashcard.bookmarked === true))
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchNotebooksData();
  }, [API_URL, notebookId]);

  // 特定の単語帳を取得する処理
  useEffect(() => {
    const fetchNotebookData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notebooks/${notebookId}`);

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();
        setNotebook(result)
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

  useEffect(() => {
    if (bookmarkedOnly) {
      setUseFlashcards(bookmarkedFlashcards);
    } else {
      setUseFlashcards(flashcards);
    }
  }, [bookmarkedOnly, flashcards, bookmarkedFlashcards]);

  // ブックマークのみモードに切り替えたときインデックスを0で再初期化
  useEffect(() => {
    setCurrentFlashcardIndex(0)
    setIsFlipped(false)
  }, [bookmarkedOnly])

  if (error) {
    return <div>error: {error}</div>;
  }

  // 単語帳が登録されていないときの処理
  if (!useFlashcards) {
    return (
      <></>
    )
  }

  const currentFlashcard = useFlashcards[currentFlashcardIndex]

  // 学習進行度のパラメータ
  const progress = useFlashcards.length > 0 ? ((currentFlashcardIndex + 1) / useFlashcards.length) * 100 : 0

  // 裏向きのまま次に進んだ時に裏が見えないように少し待機時間を挟む処理
  const handleNext = () => {
    if (isFlipped) {
      setTimeout(() => {
        setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      }, 600);
      setIsFlipped(false);

    } else {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    }
  }

  // 裏向きのまま前に戻った時に裏が見えないように少し待機時間を挟む処理
  const handlePrevious = () => {
    if (isFlipped) {
      setTimeout(() => {
        setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      }, 600);
      setIsFlipped(false);

    } else {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    }
  }

  // 詳細説明が表示されている場合は反転を制限
  const handleFlip = (e: React.MouseEvent) => {
    if (!isDetailOpen) { 
      setIsFlipped(!isFlipped);
    }
    
    e.stopPropagation();
  };

  // 学習中に知っていた単語カードの追加、削除処理
  const handleKnown = () => {
    setKnownFlashcards((prev) => {
      if (!prev.includes(currentFlashcard.flashcardId)) {
        return [...prev, currentFlashcard.flashcardId];
      }
      return prev;
    });

    // unknownに登録されていた場合は削除
    setUnknownFlashcards((prev) => prev.filter((id) => id !== currentFlashcard.flashcardId));
  };

  // 学習中に、ブックマーク登録されている単語カードの中で知っていた単語カードの追加、削除処理
  const handleBookmarkedKnown = () => {
    setBookmarkedKnownFlashcards((prev) => {
      if (!prev.includes(currentFlashcard.flashcardId)) {
        if (!bookmarkedFlashcards) {
          return prev;
        }
        if (bookmarkedFlashcards.some((flashcard) => flashcard.flashcardId === currentFlashcard.flashcardId)) {
          return [...prev, currentFlashcard.flashcardId];
        }
      }
      return prev;
    });

    // unknownに登録されていた場合は削除
    setUnknownFlashcards((prev) => prev.filter((id) => id !== currentFlashcard.flashcardId));
  };

  // 学習中に知らなかった単語カードの追加、削除処理
  const handleUnknown = () => {
    setUnknownFlashcards((prev) => {
      if (!prev.includes(currentFlashcard.flashcardId)) {
        return [...prev, currentFlashcard.flashcardId];
      }
      return prev;
    });

    // knownに登録されていた場合は削除
    setKnownFlashcards((prev) => prev.filter((id) => id !== currentFlashcard.flashcardId));
  };

  // ブックマーク登録と解除の処理
  const toggleBookmark = (currentFlashcard: FlashcardData) => {
    setBookmarkedFlashcards((prev) => {
      return prev ? [...prev, currentFlashcard] : [currentFlashcard];
    })
  }

  // 単語カードのブックマークの状態を更新する処理
  const handleBookmarked = async (flashcardId: string, bookmarked: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/flashcards/${flashcardId}`, {

        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookmarked: !bookmarked }),
      });

      if (!response.ok) {
        throw new Error("単語カード情報の更新に失敗しました");
      }

      setFlashcards((prevFlashcards) =>
        prevFlashcards
          ? prevFlashcards.map((flashcard) =>
            flashcard.flashcardId === flashcardId
              ? { ...flashcard, bookmarked: !flashcard.bookmarked }
              : flashcard
          )
          : prevFlashcards
      );

      // bookmarkedの状態が切り替わるため、bookmarkedFlashcardsから要素を削除、または追加をする
      setBookmarkedFlashcards((prevBookmarkedFlashcards) => {
        if (!bookmarked) {
          // 追加する
          const newFlashcard = flashcards?.find((f) => f.flashcardId === flashcardId);
          return newFlashcard ? [...(prevBookmarkedFlashcards || []), { ...newFlashcard, bookmarked: true }] : prevBookmarkedFlashcards;
        } else {
          // 削除する
          return prevBookmarkedFlashcards ? prevBookmarkedFlashcards.filter((f) => f.flashcardId !== flashcardId) : [];
        }
      });

    } catch (error) {
      console.log(error);
    }
  }

  // 構文をJSXに変換
  const formatNotes = (detail: string) => {
    if (!detail) return null

    // 太文字
    const boldFormatted = detail.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // 改行
    const lineBreaksFormatted = boldFormatted.replace(/\n\n/g, "<br/><br/>")

    // 空白
    const listFormatted = lineBreaksFormatted.replace(/- (.*?)(?=\n|$)/g, "• $1")

    return <div dangerouslySetInnerHTML={{ __html: listFormatted }} />
  }

  // 詳細内容の開閉状態を切り替える処理
  const handleSheetOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailOpen(true);
  };
  const handleSheetClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailOpen(false);
  };

  return (
    <div className="container w-[90%] mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col px-4 py-6">

      <div className="mb-4">
        <Link
          href={`/groups/${groupId}/notebooks/${notebookId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          単語カード一覧に戻る
        </Link>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{notebook.title}</h1>
          <div className="flex items-center space-x-2">
            <Switch id="bookmarked-mode" checked={bookmarkedOnly} onCheckedChange={setBookmarkedOnly} />
            <Label htmlFor="bookmarked-mode" className="text-sm">
              ブックマークのみ
            </Label>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Card {useFlashcards.length > 0 ? currentFlashcardIndex + 1 : 0} of {useFlashcards.length}
          </span>
          <span className="text-sm text-muted-foreground">{bookmarkedOnly ? bookmarkedKnownFlashcards.length : knownFlashcards.length} known</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {useFlashcards.length > 0 ? (
        
        <div className="flex flex-1 flex-col items-center mt-10">
          <div className="relative mx-auto w-full max-w-md cursor-pointer perspective-1000">
            <div
              className={`relative h-64 w-full transform-style-3d transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
              onClick={handleFlip}
            >
              <Card className={`absolute h-[80%] md:h-full w-full backface-hidden border-2 ${knownFlashcards.includes(currentFlashcard.flashcardId) ? "border-blue-500" : "border-gray-700"} ${unknownFlashcards.includes(currentFlashcard.flashcardId) ? "border-red-500" : ""}`}>
                <CardContent className="flex h-full flex-col items-center justify-center p-6">
                  <h2 className="text-center text-3xl font-bold">{currentFlashcard.front_text}</h2>
                  <p className="mt-4 text-center text-sm text-muted-foreground">クリックして裏面を確認</p>
                </CardContent>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarked(currentFlashcard.flashcardId, currentFlashcard.bookmarked);
                  }}
                  className={`absolute top-2 right-2 z-10 ${currentFlashcard.bookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}`}
                >
                  {currentFlashcard.bookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </Card>

              <Card className="absolute h-[80%] md:h-full w-full rotate-y-180 backface-hidden border-2 border-green-500">
                <CardContent className="flex h-full flex-col items-center justify-between p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-center text-xl">{currentFlashcard.back_text}</p>
                  </div>
                  <div className="flex w-full items-center justify-center" onClick={handleSheetClose}>
                    {currentFlashcard.detail && (
                      <Sheet>
                        <SheetTrigger asChild onClick={handleSheetOpen}>
                          <Button variant="outline" size="sm">
                            <Book className="mr-2 h-4 w-4" />
                            詳細を確認
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md overflow-y-auto" onClick={handleSheetClose}>
                          <SheetHeader>
                            <SheetTitle>{currentFlashcard.front_text}</SheetTitle>
                            <SheetDescription>{currentFlashcard.back_text}</SheetDescription>
                          </SheetHeader>
                          <Separator className="my-4" />
                          <div className="prose prose-sm mt-4 text-muted-foreground">
                            {formatNotes(currentFlashcard.detail)}
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </div>
                </CardContent>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(currentFlashcard);
                    handleBookmarked(currentFlashcard.flashcardId, currentFlashcard.bookmarked);
                  }}
                  className={`absolute top-2 right-2 z-10 ${currentFlashcard.bookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}`}
                >
                  {currentFlashcard.bookmarked ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </Card>
            </div>
          </div>

          <div className="md:mt-12 flex w-full max-w-md justify-between">
            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentFlashcardIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" className="w-32" onClick={handleUnknown}>
                <X className="mr-2 h-4 w-4" />
              </Button>
              <Button variant="default" className="w-32" onClick={() => { handleKnown(); handleBookmarkedKnown(); }}>
                <Circle className="mr-2 h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={currentFlashcardIndex === useFlashcards.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>

      ) : (

        <div className="flex flex-1 flex-col items-center justify-center text-center mb-80">
          <h3 className="text-xl font-medium">表示できる単語カードがありません</h3>
          <p className="mt-2 text-muted-foreground">
            {bookmarkedOnly
              ? "重要な単語カードにブックマークをつけましょう！"
              : "単語カードを作成しましょう！"}
          </p>
          {bookmarkedOnly && (
            <Button variant="outline" className="mt-4" onClick={() => setBookmarkedOnly(false)}>
              全ての単語カードを表示
            </Button>
          )}
        </div>

      )}

    </div>
  );
};  