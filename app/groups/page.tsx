"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, FolderOpen, Heart, PenLine, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { ConfirmationModal } from "@/components/ui/Modal"
import { useSession } from "next-auth/react"

interface GroupData {
  groupId: string;
  groupname: string;
  description: string;
  notebooks: number;
  flashcards: number;
}

export default function ShowGroupsPage() {
  const { data: session } = useSession();

  // 取得した全ての単語帳グループ情報を配列で管理
  const [groupsData, setGroupsData] = useState<GroupData[] | null>(null);

  //モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  //選択された単語帳グループのIDを管理
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [error, setError] = useState<string>("");

  // 初回ログインユーザーの登録処理
  useEffect(() => {
    if (!session) {
      console.log("セッション情報が見当たりません")
      return;
    }

    const sub = session.user?.id

    const createUser = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/users`, {

          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sub: sub }),

        });

        if (!response.ok) {
          throw new Error("ユーザー登録に失敗しました");
        }

      } catch (error) {
        console.error(error);
      }
    };

    createUser();
  }, [session]);

  // 全ての単語帳グループ情報を一括取得する処理
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/groups");

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const result = await response.json();

        setGroupsData(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      }
    };

    fetchData();
  }, []);
  if (error) {
    return <div>error: {error}</div>;
  }

  // 単語帳グループの削除処理
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/groups/${selectedGroupId}`, {

        method: "DELETE",

      });

      if (!response.ok) {
        throw new Error("単語グループ情報の削除に失敗しました");
      }

      setGroupsData((prevGroups) =>
        prevGroups
          ? prevGroups.filter(
            (group) => group.groupId !== selectedGroupId
          )
          : prevGroups
      );

      setIsModalOpen(false);

    } catch (error) {
      console.log(error);
    }
  }

  // 削除処理の二段階確認用モーダル
  const openDeleteModal = (flashcardId: string) => {
    setSelectedGroupId(flashcardId);
    setIsModalOpen(true);
  };

  return (
    <div className="container w-[90%] mx-auto px-4 py-6">

      <div className="mb-8 flex flex-col gap-4 md:flex-row items-center justify-between">
        <div>
          <h1 className="text-center md:text-left text-2xl font-bold tracking-tight">単語帳グループ</h1>
          <p className="text-muted-foreground">あなたの単語帳をテーマごとに整理しましょう！</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/liked-notebooks">
              <Heart className="mr-2 h-4 w-4 text-red-500 fill-red-500" />
              お気に入りの単語帳
            </Link>
          </Button>
          <Button asChild>
            <Link href="/groups/group-create" className="flex justify-center items-center">
              <Plus className="mr-2 h-4 w-4" />
              グループの作成
            </Link>
          </Button>
        </div>
      </div>

      {/* 単語帳グループの情報が取得できるまでは何も表示せず、そもそも単語帳グループの情報がない場合はその旨を表示する */}
      {groupsData === null ? (
        <></>
      ) : groupsData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groupsData.map((group) => (
            <div key={group.groupId} className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-start items-center gap-4">
                    <Link href={`/groups/${group.groupId}`}>
                      <CardTitle>{group.groupname}</CardTitle>
                    </Link>
                    <div className="flex justify-start items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/groups/${group.groupId}/group-edit`}>
                          <PenLine className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteModal(group.groupId)}>
                        <div>
                          <Trash2 className="h-4 w-4" />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <Link href={`/groups/${group.groupId}`}>
                    <CardDescription>{group.description}</CardDescription>
                  </Link>
                </CardHeader>
                <Link href={`/groups/${group.groupId}`}>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FolderOpen className="mr-1 h-4 w-4" />
                      <span className="mr-4">{group.notebooks} notebooks</span>
                      <BookOpen className="mr-1 h-4 w-4" />
                      <span>{group.flashcards} flashcards</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[50vh] w-full">
          <p className="text-center text-muted-foreground text-lg">新しい単語帳グループを作成しましょう！</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        message="この単語グループを削除してもよろしいですか？"
      />

    </div>
  )
}

