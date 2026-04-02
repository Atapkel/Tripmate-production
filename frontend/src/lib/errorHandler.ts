import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (data?.detail) {
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((e: { msg: string }) => e.msg).join(", ");
      }
    }

    switch (status) {
      case 400: return "Invalid request. Please check your input.";
      case 401: return "Session expired. Please log in again.";
      case 403: return "You don't have permission to do this.";
      case 404: return "The requested resource was not found.";
      case 409: return "This action conflicts with existing data.";
      case 422: return "Validation error. Check your input.";
      case 429: return "Too many requests. Please wait a moment.";
      case 500: return "Server error. Please try again later.";
      default: return "An unexpected error occurred.";
    }
  }

  if (error instanceof Error) return error.message;
  return "An unknown error occurred.";
}
