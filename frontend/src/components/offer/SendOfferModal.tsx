import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { offerSchema, type OfferFormData } from "@/lib/validators";
import { offerService } from "@/services/offerService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface SendOfferModalProps {
  tripId: number;
  onClose: () => void;
}

export function SendOfferModal({ tripId, onClose }: SendOfferModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
  });

  const message = watch("message") || "";

  const mutation = useMutation({
    mutationFn: (data: OfferFormData) => offerService.create({ trip_vacancy_id: tripId, message: data.message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.received });
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.forTrip(tripId) });
      toast.success("Offer sent! The trip creator will review it.");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Modal isOpen onClose={onClose} title="Send Offer">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <Textarea
          id="message"
          label="Why do you want to join this trip?"
          placeholder="Tell the trip creator about yourself and why you'd be a great companion..."
          rows={4}
          showCount
          maxLength={1000}
          currentLength={message.length}
          error={errors.message?.message}
          {...register("message")}
        />
        <div className="flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth isLoading={mutation.isPending}>Send Offer</Button>
        </div>
      </form>
    </Modal>
  );
}
