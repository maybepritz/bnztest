"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Link, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownItem } from "@/shared/ui/DropdownMenu";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui";
import { deletePostAction } from "../actions";
import { ReportModal } from "./ReportModal";

interface PostDropdownProps {
  postId: string;
  onEditClick?: () => void;
  isOwn: boolean;
}

export function PostDropdown({ postId, onEditClick, isOwn }: PostDropdownProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deletePostAction(postId);
      setIsDeleteModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = () => {
    setIsReportModalOpen(true);
  };

  const trigger = (
    <button className="text-secondary hover:text-primary transition-colors p-1 -mr-2">
      <MoreHorizontal size={20} />
    </button>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu trigger={trigger} align="right">
        {isOwn ? (
          <>
            {onEditClick && (
              <DropdownItem 
                onClick={() => onEditClick?.()}
                icon={<Pencil size={16} />}
              >
                Редактировать
              </DropdownItem>
            )}
            <DropdownItem 
              onClick={() => setIsDeleteModalOpen(true)}
              icon={<Trash2 size={16} />}
              danger={true}
            >
              Удалить
            </DropdownItem>
          </>
        ) : (
          <>
            <DropdownItem 
              onClick={handleCopyLink}
              icon={<Link size={16} className={copied ? "text-green-500" : ""} />}
            >
              {copied ? "Скопировано!" : "Скопировать ссылку"}
            </DropdownItem>
            <DropdownItem 
              onClick={handleReport}
              icon={<AlertTriangle size={16} />}
              danger={true}
            >
              Пожаловаться
            </DropdownItem>
          </>
        )}
      </DropdownMenu>

      {isOwn && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Удалить пост?">
          <div className="flex flex-col gap-4 mt-4" onClick={e => e.stopPropagation()}>
            <p className="text-secondary">Это действие нельзя будет отменить. Пост будет удален навсегда.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>Отмена</Button>
              <Button variant="danger" onClick={handleDelete} disabled={isLoading}>Удалить</Button>
            </div>
          </div>
        </Modal>
      )}

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        postId={postId} 
      />
    </div>
  );
}
