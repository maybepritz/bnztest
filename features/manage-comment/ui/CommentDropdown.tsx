"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownItem } from "@/shared/ui/DropdownMenu";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui";
import { deleteCommentAction } from "../actions";

interface CommentDropdownProps {
  commentId: string;
  postId: string;
  onEditClick: () => void;
}

export function CommentDropdown({ commentId, postId, onEditClick }: CommentDropdownProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteCommentAction(commentId, postId);
      setIsDeleteModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const trigger = (
    <button className="text-secondary hover:text-primary transition-colors p-1 -mr-2">
      <MoreHorizontal size={16} />
    </button>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu trigger={trigger} align="right">
        <DropdownItem 
          onClick={(e) => { e.stopPropagation(); onEditClick(); }}
          icon={<Pencil size={14} />}
        >
          Редактировать
        </DropdownItem>
        <DropdownItem 
          onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}
          icon={<Trash2 size={14} />}
          danger={true}
        >
          Удалить
        </DropdownItem>
      </DropdownMenu>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Удалить комментарий?">
        <div className="flex flex-col gap-4 mt-4" onClick={e => e.stopPropagation()}>
          <p className="text-secondary text-sm">Это действие нельзя будет отменить.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>Отмена</Button>
            <Button variant="danger" onClick={handleDelete} disabled={isLoading}>Удалить</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
