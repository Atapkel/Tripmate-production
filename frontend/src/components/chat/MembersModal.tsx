import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";
import { queryKeys } from "@/lib/queryKeys";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";

interface MembersModalProps {
  chatId: number;
  isOpen: boolean;
  onClose: () => void;
}

function resolvePhoto(photo?: string | null): string | null {
  if (!photo) return null;
  return photo.startsWith("http") ? photo : `/${photo}`;
}

export function MembersModal({ chatId, isOpen, onClose }: MembersModalProps) {
  const { data: members, isLoading } = useQuery({
    queryKey: queryKeys.chats.members(chatId),
    queryFn: () => chatService.getMembers(chatId).then((r) => r.data),
    enabled: isOpen && !!chatId,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Members" size="sm">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : !members || members.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-4">No members found</p>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar
                src={resolvePhoto(member.profile_photo)}
                initials={member.user_name?.charAt(0)?.toUpperCase()}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {member.user_name || "Unknown user"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
